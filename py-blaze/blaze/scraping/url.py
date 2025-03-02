from urllib.parse import urlparse, urlunparse
import re
import time
import requests
from bs4 import BeautifulSoup
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import tldextract
import ssl
import functools
if hasattr(ssl, '_create_unverified_context'):
    ssl._create_default_https_context = ssl._create_unverified_context
user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

def debug_methods(cls):
    for key, val in list(vars(cls).items()):
        if callable(val) and key != "__init__":
            setattr(cls, key, debug(val))
    return cls

def debug(func):
    @functools.wraps(func)
    def wrapper_debug(self, *args, **kwargs):
        if hasattr(self, 'debug') and self.debug:
            args_repr = [repr(a) for a in args]                     
            kwargs_repr = [f"{k}={v!r}" for k, v in kwargs.items()]  
            signature = ", ".join(args_repr + kwargs_repr)           
            print(f"Calling {func.__name__}({signature})")
        return func(self, *args, **kwargs)
    return wrapper_debug

@debug_methods
class URLReader:
    def __init__(
            self, 
            url,
            join_char=' ',
            chrome_driver_path=None, 
            timeout=60, 
            headless=False,
            verbose=True,
            debug=False,
            ):
        self.url = url
        self.resolved_url = url
        self.chrome_driver_path = chrome_driver_path
        self.basedomain = get_basedomain(self.url)
        self.basedomain_list = [self.basedomain]
        self.timeout = timeout
        self.headless = headless
        self.join_char = join_char
        self.user_agent = user_agent
        self.verbose = verbose
        self.debug = debug
        self.links = None
        self.text = None
        self.text_list = None
        self.response = None
        self.soup = None

    def read(self):
        self._request()
        self._find_links()
        self._find_text()
        return self      

    def _request(self, parser='html.parser'):
        if self.headless:
            try:
                self.response, self.resolved_url = _fetch_page_with_headless_browser(
                    url=self.url, 
                    chrome_driver_path=self.chrome_driver_path, 
                    user_agent=self.user_agent,
                    timeout=self.timeout)
                if parser is not None:
                    self.soup = BeautifulSoup(self.response, parser)
            except Exception as e:
                print('Error:', e, 'could not fetch page: ', self.url)
        else:
            # Fetch the HTML content of the URL using requests
            session = requests.Session()
            session.headers.update({'User-Agent': self.user_agent})
            self.response = session.get(self.url, timeout=self.timeout)
            # If the request is successful (status code 200), parse the content
            self.status_code = self.response.status_code
            if self.response.status_code == 200:
                self.resolved_url = self.response.url
            if parser is not None:
                self.soup = BeautifulSoup(self.response.content, parser)

        self.basedomain_list = list(set([self.basedomain, get_basedomain(self.resolved_url)]))
        
        
    def _find_links(self):
        exclude = []

        # GET RSS FEEDS
        rss_feeds, exclude = _get_rss_feeds(
            self.soup, self.basedomain, exclude=exclude)

        # GET EMAIL ADDRESSES
        email_addresses, exclude = _get_email_links(
            self.soup, exclude=exclude)

        # GET BLOG LINKS
        blog_links, exclude = _get_blog_links(
            self.soup, self.basedomain, exclude=exclude)

        # GET ALL OTHER LINKS: internal, subdomain & external
        int_urls, sub_urls, ext_urls = \
            _get_other_links(
                soup=self.soup, 
                basedomain=self.basedomain, 
                basedomain_list=self.basedomain_list, 
                exclude=exclude)
        
        # roll into a dictionary
        self.links = {
            'internal': int_urls,
            'subdomain': sub_urls,
            'rss': rss_feeds,
            'blog': blog_links, 
            'email': email_addresses,
            'external': ext_urls
            }
        return self.links
        
    def _find_text(self):
        # meta description and title
        soup_ttl = self.soup.title
        meta_title = soup_ttl.text if soup_ttl is not None else ''
        meta_description = self.soup.find('meta', attrs={'name': 'description'})
        meta_description = meta_description['content'] if meta_description else ''
        # Remove all HTML tags and formatting and get only the plain text
        textbits = self.soup.find_all(['p', 'code', 'pre', 'span', 'h1', 'h2', 'h3', 'h4'])
        textbits = textbits if textbits else ''
        # get the text from each tag
        text_list = [meta_title, meta_description] + \
            [x.get_text(separator=' ', strip=True) for x in textbits]
        # remove any strings that contain only one word
        text_list = [x for x in text_list if len(x.split()) > 1]
        #  clean each string
        text_list = [_clean_text(x) for x in text_list]
        # join the list of strings into one string
        self.text = self.join_char.join(text_list)

def _strip_trailing_slash(url):
    # trim off trailing /
    if url.endswith('/'):
        url = url[:-1]
    return url

def get_basedomain(url):
    try:
        parsed_uri = urlparse(url)
        result = f'{parsed_uri.scheme}://{parsed_uri.netloc}/'
        # if medium, dev.to blog, or google site truncate to the base domain + path[1]
        site_list = {
            'medium.com': ['medium.com/about'],
            'sites.google.com':[],
            'dev.to':['dev.to/t/', 'dev.to/tags/', 'dev.to/about/', 'dev.to/terms', 'dev.to/privacy', 'dev.to/faq', 'dev.to/pod', 'dev.to/forem'],
            }
        # cycle through the site list and check if the url contains the site
        for s in list(site_list.keys()):
            s_in_exclude = any([x in url for x in site_list[s]])
            if (s in parsed_uri.netloc) and not s_in_exclude:
                if parsed_uri.path != '':
                    result = result + parsed_uri.path.split('/')[1]
                    break
    except:
        result = None
    return result
    
def _fetch_page_with_headless_browser(url, timeout, user_agent, proxies=None, chrome_driver_path=None):
    """
    Fetches webpage content using a headless Chrome browser with customized settings.
    
    Args:
        url (str): The URL to fetch
        timeout (int): Maximum time in seconds to wait for page load
        user_agent (str): User agent string to use for the request
        proxies (dict, optional): Proxy configuration to use
        chrome_driver_path (str, optional): Path to Chrome driver executable
        
    Returns:
        tuple: (page_source, resolved_url) containing the HTML content and final URL after redirects
    """
    # Configure headless browser
    options = Options()
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("--disable-extensions")
    options.add_argument('--headless')
    options.add_argument("--incognito")
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    options.add_argument(f'user-agent={user_agent}')

    if chrome_driver_path:
        s = Service()
        driver = webdriver.Chrome(executable_path=chrome_driver_path, service=s, options=options)
    else:
        s = Service()
        driver = webdriver.Chrome(service=s, options=options)
    driver.set_page_load_timeout(timeout)
    try:
        driver.get(url)
        user_agent = driver.execute_script("return navigator.userAgent;")
        time.sleep(1)
        _scroll_to_bottom(driver, timeout)
    except:
        print(f'  Problem reading {url}')
    finally:
        page_source = driver.page_source
        resolved_url = driver.current_url
        driver.delete_all_cookies()
        driver.quit()

    return page_source, resolved_url

def _scroll_to_bottom(driver, timeout, scroll_pause_time=1):
    last_height = driver.execute_script("return document.body.scrollHeight")
    start_time = time.time()
    while True:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(scroll_pause_time)
        new_height = driver.execute_script("return document.body.scrollHeight")
        # keep track of the time elapsed, if the time elapsed is greater than the timeout, exit
        elapsed_time = time.time() - start_time
        if (new_height == last_height) or (elapsed_time > timeout):
            break
        last_height = new_height

def _clean_links(url_list, basedomain):
    # remove None and / from the list
    url_list = [x for x in url_list if x not in ['/', None]]
    # if starts with www. then add https://
    url_list = ['https://' + x if x.startswith('www.') else x for x in url_list]
    # if starts with // then add https:
    url_list = ['https:' + x if x.startswith('//') else x for x in url_list]
    # starts with / is relative to base
    url_list = [_strip_trailing_slash(basedomain) + x 
                if x.startswith('/') else x for x in url_list]
    # if does not start with http assume relative to base
    url_list = [_strip_trailing_slash(basedomain) + '/' + x
                if not x.startswith('http') else x for x in url_list]
    # dedupe
    return list(set(url_list))

def _get_rss_feeds(soup, basedomain, exclude):
    # Find all the <link> or <a> tags with a type attribute of 'application/rss+xml'
    rss_link = soup.find_all('link', type='application/rss+xml')
    rss_a = soup.find_all('a', type='application/rss+xml')
    atom_link = soup.find_all('link', type='application/atom+xml')
    atom_a = soup.find_all('a', type='application/atom+xml')
    # html a tags with feedburner in the href
    feed_patterns = [
        'feedburner', 'feed.rss', 'index.xml', 
        'rss.xml', 'blog.xml', 'feed.xml', '/feed/?$', 
        '/rss/?$', 'atom.xml', 'posts.xml'
        ]
    link_list = []
    for pattern in feed_patterns:
        link_list += soup.find_all('a', href=lambda x: x and re.search(pattern, x) is not None)
    # rss found
    rss_links = rss_link + rss_a + atom_link + atom_a + link_list
    rss_feeds_raw = [x.get('href') for x in rss_links]
    # exclude links that contain these patterns
    exclude_patterns = ['/category/', '/tag/', '/tags/']
    rss_feeds_clean = [x for x in rss_feeds_raw if not any(
        pattern in x for pattern in exclude_patterns)]
    rss_feeds_clean =_clean_links(rss_feeds_clean, basedomain)
    rss_feeds_clean = [x for x in rss_feeds_clean if x not in exclude]
    exclude = exclude + rss_feeds_raw + rss_feeds_clean
    return list(set(rss_feeds_clean)), list(set(exclude))

def _get_blog_links(soup, basedomain, exclude):
    blog_patterns = [
        '/blog\.', '/blog/?$', '/posts?/?$', 'blog\.html$', '/articles?/?$',
        'posts\.html$', '/news/?$', '\.substack\.com/?', 'medium\.com/?', 'dev\.to/?', 
        'newsletter/?$'
        ]
    blog_links = []
    for pattern in blog_patterns:
        blog_links += soup.find_all(
            'a', href=lambda x: x and re.search(pattern, x) is not None)
    blog_links += soup.find_all(
        lambda tag: tag.name == 'a' and re.search('^blog$', tag.text, re.IGNORECASE))
    blog_links_raw = [x.get('href') for x in blog_links]
    blog_links_clean =_clean_links(blog_links_raw, basedomain)
    blog_links_clean = _remove_prefixes(blog_links_clean)
    blog_links_clean = [_truncate_url(url, ['blog', 'post', 'article'])
                        for url in blog_links_clean]
    blog_links_clean = [x for x in blog_links_clean if x not in exclude]
    exclude = exclude + blog_links_raw + blog_links_clean
    return list(set(blog_links_clean)), list(set(exclude))

def _get_email_links(soup, exclude):
    email_patterns = ['mailto:']
    email_links = []
    for pattern in email_patterns:
        email_links += soup.find_all(
            'a', href=lambda x: x and re.search(pattern, x) is not None)
    email_links_raw = [x.get('href') for x in email_links]
    email_links_clean = [x.replace('mailto:', '') for x in email_links_raw]
    email_links_clean = [x for x in email_links_clean if x not in exclude]
    exclude = exclude + email_links_raw + email_links_clean
    return list(set(email_links_clean)), list(set(exclude))

def _get_other_links(soup, basedomain, basedomain_list, exclude):
    """
    Extracts and categorizes links from a BeautifulSoup object into internal, subdomain, and external links.
    
    Args:
        soup (BeautifulSoup): Parsed HTML content
        basedomain (str): Primary domain of the page being processed
        basedomain_list (list): List of domains considered "internal"
        exclude (list): List of URLs to exclude from results
        
    Returns:
        tuple: (internal_urls, subdomain_urls, external_urls) containing lists of categorized URLs
    """
    a_tags = soup.find_all('a')
    links = [x.get('href') for x in a_tags]
    links = [x for x in links if x not in exclude]
    links = _clean_links(links, basedomain)
    links = [x for x in links if x not in exclude]

    # get internal links
    int_urls = []
    for bd in basedomain_list:
        int_urls += [x for x in links if x.startswith(bd)]
    int_urls = list(set(int_urls + basedomain_list))

    links = [x for x in links if x not in int_urls]
    # find links to subdomains
    sub_urls = [x for x in links 
                if tldextract.extract(x).domain == \
                    tldextract.extract(basedomain).domain]
    # external links
    ext_urls = [x for x in links if x not in sub_urls + int_urls]
    return list(set(int_urls)), list(set(sub_urls)), list(set(ext_urls))

def _clean_text(text):
    # replace non-breaking space and zero-width space with regular space
    for char in ['\xa0', '\u200b', '\u200c']:
        text = text.replace(char, ' ')
    # replace • and | symbols with spaces
    text = text.replace('•', ' ').replace('|', ' ')
    # remove these weird characters
    text = text.replace('â', '') \
        .replace('Â', '').replace('©', '') \
        .replace('×', '').replace(' // ', ' ') \
    # remove tabs and newlines
    text = text.replace('\n', ' ').replace('\t', ' ')
    # ensure full stops and commas are not preceded by a space
    text = text.replace(' .', '.').replace(' ,', ',')
    # remove any multiple full stops or commas
    text = text.replace('.+', '.').replace(',+', ',')
    # remove all excess whitespace
    text = re.sub(' +', ' ', text)
    # remove any whitespace at the beginning or end of the string
    text = text.strip()
    # add a full-stop if the text does not end with a full-stop, question mark, or exclamation mark
    if not text.endswith(('.', '?', '!')):
        text += '.'
    return text

def _remove_prefixes(lst):
    result = []
    for s1 in lst:
        if not any(s1.startswith(s2) for s2 in lst if s1 != s2):
            result.append(s1)
    return result

def _truncate_url(url, words):
    parsed = urlparse(url)
    path_parts = parsed.path.split('/')
    for i, part in enumerate(path_parts):
        if any(word in part for word in words):
            truncated_path = '/'.join(path_parts[:i+1])
            return urlunparse((parsed.scheme, parsed.netloc, truncated_path, '', '', ''))
    return url  # Return the original url if none of the words were found



