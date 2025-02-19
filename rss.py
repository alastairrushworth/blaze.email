import pandas as pd
from dateutil.parser import parse
from ..data.postgres import url_in_table, PG
from ..scraping import read_rss, CorpusReader, get_basedomain
from ..ai.llm import llm_completion
from catboost import CatBoostClassifier, Pool
from sklearn.model_selection import train_test_split
import os

def feed_checker(rss_df):
    # if title column is all null, return error
    if rss_df.title.isnull().all():
        raise ValueError('No titles found in RSS feed')
    # if link column is all null, return error
    if rss_df.link.isnull().all():
        raise ValueError('No links found in RSS feed')
    # if published column is all null, return error
    if rss_df.published.isnull().all():
        raise ValueError('No published dates found in RSS feed')
    
class DescribeRSS():
    def __init__(
            self, 
            rss: str, 
            model: str =  os.environ['DEFAULT_CHEAP_LLM'],
            ):
        self.rss = rss
        self.model = model
        detail_attrs = [
            'baseurl', 'post_md_int', 'post_mn_int', 'post_length', 'post_latest',
            'tech_score', 'site_type', 'site_summary_dict', 'owner_name', 'owner_type', 
            'long_summary', 'short_summary', 'lang', 'status']
        for attr in detail_attrs:
            setattr(self, attr, None)

    def read(self):
        try:
            self._read_feed()
            self._feed_stats()
            self._content_extract()
        except Exception as e:
            print('Error reading feed:', self.rss, e)
            self.status = e
        
        # return results as dict
        self.details = {
            'rss': self.rss,
            'baseurl': self.baseurl,
            'post_md_int': self.post_md_int,
            'post_mn_int': self.post_mn_int,
            'post_length': self.post_length,
            'post_latest': self.post_latest,
            'tech_score': int(self.site_type['tech_score']) if self.site_type else None,
            'site_type': self.site_type['site_type'] if self.site_type else None,
            'owner_name': self.site_summary_dict['owner_name'] if self.site_summary_dict else None,
            'owner_type': self.site_summary_dict['owner_type'] if self.site_summary_dict else None,
            'long_summary': self.site_summary_dict['long_summary'] if self.site_summary_dict else None,
            'short_summary': self.site_summary_dict['short_summary'] if self.site_summary_dict else None,
            'lang': self.site_summary_dict['lang'] if self.site_summary_dict else None,
            'model': self.model,
            'status': str(self.status) if self.status else 'ok'
        }

    def _read_feed(self):
        # read the rss feed
        try:
            self.posts = RecentPosts([self.rss], timeout=30)
            self.posts.read_feeds()
        except:
            self.posts = None
        # check the feed
        feed_checker(self.posts.all_items)

    def _feed_stats(self):
        if self.posts:
            top_5_urls = self.posts.all_items.head(5).link.unique()
            self.post_length = _ave_page_length(top_5_urls)
                # combine all items from all feeds
            items = self.posts.all_items \
                .sort_values('dt_published', ascending=False) \
                .reset_index(drop=True)
            
            # average days between posts
            self.diff_days = items.dt_published.diff().dt.total_seconds() / 60 / 60 / 24
            self.post_md_int = round(self.diff_days.dropna().abs().median(), 3)
            self.post_mn_int = round(self.diff_days.dropna().abs().mean(), 3)
            self.post_latest = str(items.dt_published.max())
            self.posts_10 = self.posts.all_items.head(10)
            # get the most common base domain
            bd = self.posts_10.link.apply(get_basedomain)
            self.baseurl = [bd.value_counts().index[0]]
    
    def _content_extract(self):
        if self.posts:
            posts_10 = self.posts.all_items.head(10)
            site_types = [
                'individual / personal blog',
                'academic journal',
                'commercial / product site', 
                'company engineering blog',
                'conference / event site',
                'educational courses / tutorial site',
                'discussion forum / community site',
                'government / non-profit organization site',
                'news / media publication',
                'adult / nsfw site',
                'periodic newsletter digest',
                'official university site'
            ]

            # create quoted comma separated list
            site_types = ', '.join([f'"{x}"' for x in site_types])

            # create shortened summaries
            try:
                posts_10 = posts_10 \
                    .assign(summary = lambda x: x['summary'].apply(lambda y: y[:500])) 
            except:
                posts_10 = posts_10 \
                    .assign(summary = '')    

            posts_sub = posts_10 \
                .assign(title_link = \
                    lambda x: x['title'] + ': ' + x['link'] + '. (published: ' + x['dt_published'].astype(str) + ')') \
                .assign(title_link_nwords = lambda x: x['title_link'].apply(lambda x: len(x.split()))) \
                .assign(title_link_cum_words = lambda x: x['title_link_nwords'].cumsum()) \
                .query('title_link_cum_words <= 500')

            recent_content = '- ' + '''\n- '''.join(posts_sub.title_link.to_list())

            # text from about pages
            about = CorpusReader(
                self.baseurl, 
                timeout=10,
                threads=1, 
                headless=False, 
                about_search=True,
                )
            about.read()
            about_text = about.corpus[self.baseurl[0]].text
            
            # truncate about text to first 250 words
            about_text = about_text.split()[:250]
            about_text = ' '.join(about_text)

            # combine recent content and about text into a prompt
            prompt = f'''
            I'd like you to help me to summarise content from the RSS feed "{self.rss}". Here is text from the 'about' page of the source site:

            {about_text}

            Here are some recent posts from the feed:

            {recent_content}

            I'd like you to return 
            
            - [long_summary] a max. 200 word summary describing what the site is about and what to expect, please make sure to use any domain specific language in the summary that you find in the above context. For company and organisational sites, you should focus more on what they do when writing the summary.  For personal sites, focus more on summarising what the individuals interests seem to be.
            - [short_summary] a short summary of the feed content that could serve as a description of the site, for example, for a search engine. This should be a single sentence of no more than 50 words and should be a high-level summary of the site's content - do not mention the site's name or URL.
            - [owner_name] the name of the site owner(s) as a comma separated list.  If the site is a company or organisation, you must return the name of the org instead of any people. 
            - [owner_type] whether the owner appears to be a 'company', 'organisation' or an 'individual'. only choose 'organisation' for entities that non-commercial or non-product entities.
            - [lang] the iso 639-1 language code of the site content.
            
            Please return your response as a python dict with keys 'long_summary', 'short_summary', 'owner_name', 'owner_type' and 'lang', and values as strings.
            Begin your response with the opening brace of the dict, do not include any other text in your response. Please escape all quotes or apostrophes in your response.
            '''
            self.site_summary_dict, _ = llm_completion(prompt, model=self.model, with_eval=True)

            # combine recent content and about text into a prompt
            prompt = f"""
            I'd like you to help me to classify the overall type of a website whose RSS feed is "{self.rss}" based on the following extracted attributes of the published content:

            {self.site_summary_dict}

            I'd like you to choose from the following list: {site_types}

            I'd also like you to provide score on a scale of 1 to 10 which indicates how strongly you agree that this site can be categorised as a 'technology' site or hosting technical content.
            Please return the result as a python dict with the keys "site_type" and "tech_score".
            Begin your response with the opening brace of the dict, do not include any other text in your response. Please escape all quotes or apostrophes in your response.

            """
            self.site_type, _ = llm_completion(prompt, model=self.model, with_eval=True)
            
    def upload(self, df):
        pg = PG()
        pg.insert_df('blaze_feeds_detailed', df)


class ScoreRSS():
    def __init__(self):
        self.classifier = None
        self.data = None

    def retrain(self):
        # replace owner type with binary
        y = self.data.include
        X = train_transform(self.data)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        train_pool = Pool(X_train, y_train)
        test_pool = Pool(X_test, y_test)
        self.classifier = CatBoostClassifier(
            iterations=3000,
            learning_rate=0.005,
            depth=6,
            loss_function='Logloss',
            verbose=True
            )
        # print progress every 250 iterations
        self.classifier.fit(
            train_pool,
            eval_set=test_pool,
            plot=False,
            verbose=500,
            early_stopping_rounds=250
            )
        
    def save(self):
        self.classifier.save_model('models/rss/rss_classifier.cbm')
    
    def load(self):
        self.classifier = CatBoostClassifier()
        self.classifier.load_model('models/rss/rss_classifier.cbm')

        pg = PG()
        self.data = pg.query(
            '''
            select bfd.*, bf.include 
            from blaze_feeds_detailed as bfd
            left join (select rss, include, type from blaze_feeds) as bf
                on bfd.rss = bf.rss
            where bfd.status = 'ok' and bf.type = 'blog'
            '''
        )
    
    def score(self, dr=None):
        if dr:
            X = train_transform(pd.DataFrame(dr.details, index=[0]))
            # return the prediction as a probability
            return self.classifier.predict_proba(X)[0][1]
        else:
            df_pred = self.data.copy()
            df_pred['score'] = self.classifier.predict_proba(train_transform(self.data))[: ,1]
            df_pred = df_pred.sort_values('score', ascending=True).reset_index(drop=True)
            return df_pred
            
    
def train_transform(X):
    Xt = X.copy()
    Xt['owner_type'] = Xt.owner_type.apply(lambda x: 1 if x == 'individual' else 0)
    Xt['interval'] = (Xt['post_mn_int'] + Xt['post_md_int']) / 2
    Xt['since_last'] = (pd.Timestamp.now() - pd.to_datetime(Xt['post_latest'])).dt.days
    return Xt[['interval', 'post_length',  'tech_score', 'since_last', 'owner_type']]


def _ave_page_length(url_list):
    # read top 5 pages
        top_5_pages = CorpusReader(
            url_list, 
            timeout=10,
            threads=1, 
            headless=False, 
            about_search=False,
            )
        top_5_pages.read()
        def get_length(item):
            return len(item.text.split())
        ave_length = top_5_pages.extract(get_length, as_df=True) \
            ['get_length'].mean()
        return int(ave_length)
    

class FeedReader():
    '''
    Class to read an RSS feed and extract relevant information from the feed entries.

    Args:
        rss_feed (str): The URL of the RSS feed to read.
        timeout (int): The number of seconds to wait for the server to respond.
    
    Returns:
        FeedReader: An instance of the FeedReader class.
    '''

    def __init__(self, rss_feed: str, timeout: int = 15):
        self.rss_feed = rss_feed
        self.timeout = timeout
        self.feed = None
        self.feed_df = None

    def read(self):
        try:
            print(f'Try reading RSS: {self.rss_feed}')
            self.feed = read_rss(self.rss_feed, timeout=self.timeout)
            self.feed_to_pd()
        except Exception as e:
            print('Error reading feed:', self.rss_feed, e)
        self.summary()
        return self

    def feed_to_pd(self):
        # Extract relevant information from the feed entries
        data = []
        for entry in self.feed.entries:
            data.append({
                'title': _key_get(entry, 'title'),
                'link': _key_get(entry, 'link'),
                'author': _key_get(entry, 'author'),
                'published': _key_get(entry, 'published') or _key_get(entry, 'updated') or _key_get(entry, 'submitted') or '',
                'summary': _key_get(entry, 'summary'),
            })
        # Create a Pandas DataFrame from the extracted data
        self.feed_df = pd.DataFrame(data)

        # ensure title, link, author and summary columns are all strings
        self.feed_df['title'] = self.feed_df.title.astype(str)
        self.feed_df['link'] = self.feed_df.link.astype(str)
        self.feed_df['author'] = self.feed_df.author.astype(str)

        #  if dates are all null, attempt to extract dates from url
        if (self.feed_df.published == '').all():
            # look for date pattern 'YYYY-mm-dd' in the url
            ptrn_1 = self.feed_df.link.str.extract(r'(\d{4}-\d{2}-\d{2})')
            if not ptrn_1.isnull().all()[0]:
                self.feed_df['published'] = ptrn_1
            else:
                # look for date pattern 'YYYY/mm/dd' in the url
                ptrn_2 = self.feed_df.link.str.extract(r'(\d{4}/\d{2}/\d{2})')
                if not ptrn_2.isnull().all()[0]:
                    self.feed_df['published'] = ptrn_2

        # convert published dates to datetime
        self.feed_df = self.feed_df \
            .assign(rss=self.rss_feed) \
            .assign(dt_published = lambda x: x.published.apply(_convert_to_date)) 
        # print(self.feed_df)
        # if any of the entries do not start with http, add the domain
        self.feed_df['link'] = self.feed_df \
            .link.apply(lambda x: x if x.startswith('http') else get_basedomain(self.rss_feed) + x)
        # rmeove instances of '//' not immediately after ':'
        self.feed_df['link'] = self.feed_df.link \
            .apply(lambda x: x.replace('://', '|||')) \
            .apply(lambda x: x.replace('//', '/')) \
            .apply(lambda x: x.replace('|||', '://'))

    def summary(self):
        try:
            print(f'Read RSS: {self.rss_feed}: {str(len(self.feed_df))} of {str(len(self.feed.entries))} entries parsed.')
        except Exception as e:
            pass
        return self


class RecentPosts():
    '''
    Class to read recent posts from a list of RSS feeds.

    Args:
        rss_feeds (list): A list of RSS feed URLs to read.
        days (int): The number of days to consider as 'recent'.
        **kwargs: Additional keyword arguments to pass to the FeedReader class.
    
    Returns:
        RecentPosts: An instance of the RecentPosts class.

    '''
    def __init__(self, rss_feeds, days=14, check_existing=True, **kwargs):
        self.rss_feeds = rss_feeds
        self.days = days
        self.check_existing = check_existing
        self.kwargs = kwargs
        self.feed_list = []

    def run(self):
        self.read_feeds()
        self.get_recent_posts()
        return self

    def read_feeds(self):
        # read each RSS feed
        for feed in self.rss_feeds:
            self.feed_list.append(
                FeedReader(feed, **self.kwargs).read().feed_df)
        # lightly clean the data
        self.all_items = pd.concat(self.feed_list) \
            .dropna(subset=['link', 'published']) \
            .drop_duplicates('link') \
            .assign(date = lambda x: pd.to_datetime(x.dt_published, errors='coerce').dt.date)
    
    def get_recent_posts(self):
        # get all articles from the last X days
        self.all_recent_items = self.all_items[
            self.all_items.date > (pd.to_datetime('today') - pd.Timedelta(days=self.days)).date()] \
            .sort_values('date', ascending=False) \
            .reset_index(drop=True)
        # ensure no articles with publication date in the future
        self.all_recent_items = self.all_recent_items[
            self.all_recent_items.date <= pd.to_datetime('today').date()] \
                .reset_index(drop=True)
        self.feed_volume_filter = self.all_recent_items \
            .groupby('rss').size() \
            .sort_values(ascending=False) \
            .to_frame('count') \
            .assign(posts_per_day = lambda x: x['count'] / self.days) \
            .query('posts_per_day < 6') \
            .reset_index() \
            .rss.to_list()
        recent_items = self.all_recent_items[self.all_recent_items.rss.isin(self.feed_volume_filter)] 
        num_articles = len(recent_items)
        print(f'\nFound {num_articles} articles from {len(self.all_items.rss.unique().tolist())} feeds in the last {self.days} days.')
        if num_articles > 0:
            unresolved_urls = recent_items.link.tolist()
            if self.check_existing:
                urls_existing = url_in_table(unresolved_urls, 'blaze_content')
            else:
                urls_existing = []
            # remove existing urls
            if len(urls_existing) > 0:
                recent_items = \
                    recent_items[~recent_items.link.isin(urls_existing)] \
                        .reset_index(drop=True)
            print(f'..... of which {len(recent_items)} are new articles')
        # rename columns and select only relevant columns
        self.recent_items = recent_items \
            .rename(columns={
                'link': 'content_url', 'summary': 'description'}) \
            [['rss', 'content_url', 'title',  'dt_published', 'author', 'description']] \
            .reset_index(drop=True) \
            .assign(dt_fetched = lambda x: pd.to_datetime('now', format='%Y-%m-%d %H:%M:%S'))
        return self

def _convert_to_date(date_string):
    try:
        return parse(date_string, ignoretz=True)
    except ValueError:
        # print(f"Cannot parse date string {date_string}")
        return None
    
def _key_get(dictionary: dict, pkey: str):
    """
    Custom function to perform partial key matching in a dictionary using .get() method.
    
    Args:
        dictionary (dict): The dictionary to search.
        partial_key (str): The partial key to match.
        
    Returns:
        The value corresponding to the matched key, or None if no match is found.
    """
    # first check if the key is in the dictionary
    vl = dictionary.get(pkey)
    if vl:
        return vl
    
    # Iterate over keys in the dictionary
    for key in dictionary.keys():
        # Check if the partial key is a substring of the current key
        if pkey in key:
            # Return the value corresponding to the matched key
            return dictionary.get(key)
    # If no match is found, return None
    return None