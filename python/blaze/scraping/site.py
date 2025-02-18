import re
from io import BytesIO
import feedparser
from scraping.url import URLReader, _clean_links, _strip_trailing_slash

class SiteParse(URLReader):
    def __init__(
            self, 
            url,
            join_char=' ',
            chrome_driver_path=None, 
            timeout=60, 
            headless=False, 
            verbose=True, 
            debug=False):
        super().__init__(url)
        self.join_char = join_char
        self.chrome_driver_path = chrome_driver_path
        self.timeout = timeout
        self.headless = headless
        self.verbose = verbose
        self.debug = debug

    def _blogs(self):
        # look for blog links
        blog_links = self.links['blog']
        rss_feeds = self.links['rss']
        if (len(rss_feeds) == 0) and (len(blog_links) > 0):
            try:
                blog_links = sorted(blog_links, key=len)
                print('  Blog links: ', blog_links) if self.verbose else None
                blog_links_to_check = blog_links[:5]
                for link in blog_links_to_check:
                    rss_feeds += URLReader(
                        link, 
                        headless=self.headless,
                        verbose=True, \
                        timeout=self.timeout
                        ).read().links['rss']
            except Exception as e:
                pass
        if ((len(rss_feeds)) == 0):
            rss_feeds = _guess_rss([self.basedomain] + blog_links[:5], timeout=self.timeout)
            self.links['rss'] = rss_feeds
        print('  RSS links:', rss_feeds) if self.verbose else None

    def _about(self):
        about_links = []
        about_search = [
            x for x in self.links['internal']
            if re.search('/#?about/?|/company/?', x)]
        for bd in self.basedomain_list:
            about_links += _clean_links(about_search, bd)
        # sort by length
        self.about_links = sorted(list(set(about_links)), key=len)
        print('  About links:', self.about_links) if self.verbose else None
        try:
            self.about_text = URLReader(
                self.about_links[0],
                headless=self.headless,
                timeout=self.timeout 
                ).read().text
            self.text = self.about_text + ' ' + self.text
        except Exception as e:
            pass

def read_rss(rss_feed, timeout):
    page = URLReader(url=rss_feed, timeout=timeout, headless=False)
    page._request(parser=None)
    # Put it to memory stream object universal feedparser
    content = BytesIO(page.response.content)
    # Parse content
    feed_parsed = feedparser.parse(content)
    return feed_parsed

def _ping_rss(url, timeout):
    try:
        d = read_rss(url, timeout=timeout)
        if d.bozo == 0:
            if len(d.entries) > 0:
                return True
            else:
                return False
        else:
            return False
    except:
        print(f"Failed to connect to {url}")
        return False

def _guess_rss(base_urls, timeout):
    feeds = []
    patterns = ['index.xml', 'feed/', 'feed.xml', 'rss/']
    for url in base_urls:
        for pattern in patterns:
            try_url = _strip_trailing_slash(url) + '/' + pattern
            print('    ~ RSS guessing: ', try_url)
            try_ping = _ping_rss(try_url, timeout=timeout)
            if try_ping:
                feeds += [try_url]
    feeds = list(set(feeds))
    print('  Guessed RSS ', feeds)
    return feeds