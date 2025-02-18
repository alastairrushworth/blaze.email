import random
import pickle
import time
import pandas as pd
from ..scraping.site import SiteParse
from ..data.postgres import url_in_table, PG
import concurrent.futures

class CorpusReader():
    def __init__(
            self, 
            url_list,
            threads=1,
            **kwargs) -> None:
        # randomize the order of the urls
        random.shuffle(url_list)
        self.url_list = url_list
        self.threads = threads
        self.kwargs = kwargs
        self.corpus = None
        self.corpus_urls = None
        self.blog_search = kwargs.get('blog_search', False)
        self.about_search = kwargs.get('about_search', False)
        self.verbose = kwargs.get('verbose', True)
        self.headless = kwargs.get('headless', False)
        self.pause = kwargs.get('pause', 0)
        # get datetime now
        self.timestamp = pd.to_datetime('now', format='%Y-%m-%d %H:%M:%S')

    def read(self):
        corpus = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.threads) as executor:
            # Submit the tasks to the executor, creating a future object for each
            future_to_url = {
                executor.submit(
                    read_page,
                    url,
                    blog_search=self.blog_search, 
                    about_search=self.about_search,
                    pause=self.pause,
                    ): url for url in self.url_list}

            # As each task completes, update the status and store the result in the corpus
            for _, future in enumerate(concurrent.futures.as_completed(future_to_url)):
                url = future_to_url[future]
                if self.verbose:
                    print(f'Reading url: {url}')
                try:
                    page_url, page = future.result()  # Returns the values from the 'read_page' function
                    corpus[page_url] = page
                except Exception as exc:
                    # Handle cases where the future raises an exception
                    print(f'Reading {url} generated an exception: {exc}')
                    corpus[page_url] = None

        # Update the instance attributes once all threads have completed
        self.corpus = corpus
        self.corpus_urls = list(self.corpus.keys())
        return self

    def filter_new(self):
        urls_df = self.extract('resolved_url', as_df=True)
        urls_df.dropna(inplace=True)
        res_url_list = urls_df.resolved_url.tolist()
        res_url_list = [x for x in res_url_list if x is not None]
        urls_existing = url_in_table(res_url_list, 'blaze_content')
        if len(urls_existing) > 0:
            pop_urls = urls_df[urls_df.resolved_url.isin(urls_existing)] \
                .url.tolist()
            for url in pop_urls:
                self.delete(url)
    
    def get_backlinks(self, write=False):
        self.bcklnk_df = self.extract(get_backlinks_df, as_df=True) \
            .rename(columns={'url': 'from_url'}) \
            .assign(dt_added = lambda x: self.timestamp)
        if write:
            pg = PG()
            pg.insert_df('blaze_sites_backlinks', self.bcklnk_df)
            print(f'Wrote {self.bcklnk_df.shape[0]} backlinks to blaze_sites_backlinks')
    
    def count(self):
        return len(self.corpus)
        
    def extract(self, attr, as_df=False, nonestate=None, verbose=False, **kwargs):
        attr_dict = {}
        attr_name = attr if isinstance(attr, str) else attr.__name__
        # We'll use a with statement to ensure threads are cleaned up promptly
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.threads) as executor:
            # Prepare the list of futures. We are passing all the necessary arguments to fetch_attr
            future_to_url = {executor.submit(fetch_attr, url, self.corpus, attr, kwargs, nonestate): url for url in self.corpus_urls}
            for _, future in enumerate(concurrent.futures.as_completed(future_to_url)):
                url = future_to_url[future]
                if verbose and not isinstance(attr, str):
                    print(f'Running {attr_name}: {url}')
                try:
                    # If the result is ready, it will be retrieved, otherwise this will block until it's done
                    result = future.result()[1]
                    attr_dict[url] = result
                except Exception as exc:
                    print(f'Running {attr_name} for {url} generated an exception: {exc}')
                    attr_dict[url] = None
        if as_df:
            # get the most common type of the values in attr_dict
            types = [type(x) for x in attr_dict.values()]
            ctype = max(types, key=types.count)
            # if attr_dict has dictionary values, convert values to df, then merge
            if ctype == dict:
                # pop any items with None values
                attr_dict = {k: v for k, v in attr_dict.items() if v is not None}
                # convert dict of dicts to dataframe
                attr_df = pd.DataFrame.from_dict(attr_dict, orient='index')
                # convert dict column to dataframe
                attr_df = attr_df.reset_index(drop=False) \
                    .rename(columns={0: 'summary', 'index': 'url'})
            # if attr_dict has df values, then merge
            elif ctype == pd.DataFrame:
                attr_df = pd.concat(attr_dict) \
                    .reset_index(drop=False) \
                    .rename(columns={'level_0': 'url'}) \
                    .drop(columns=['level_1'], errors='ignore')
            # if attr_dict has string values, convert to dataframe
            else:
                attr_df = pd.DataFrame(
                    list(attr_dict.items()), columns=['url', attr_name])

            return attr_df
        else:
            return attr_dict

    def delete(self, url):
        del self.corpus[url]
        self.corpus_urls = list(self.corpus.keys())
    
    # save to pickle file
    def save(self, file_path):
        with open(file_path, 'wb') as f:
            pickle.dump(self, f)
    
    @classmethod
    def load(cls, file_path):
        with open(file_path, 'rb') as f:
            loaded_object = pickle.load(f)
        return loaded_object

def fetch_attr(url, corpus, attr, kwargs, nonestate=None):
    if corpus[url].response is not None:
        if isinstance(attr, str):
            return url, getattr(corpus[url], attr)
        elif callable(attr):
            return url, attr(corpus[url], **kwargs)
    else:
        return url, nonestate
    
def read_page(url, blog_search, about_search, pause, **kwargs): 
    time.sleep(pause)
    try:
        page = SiteParse(url, **kwargs)
        page.read()
        if blog_search:
            page._blogs()
        if about_search:
            page._about()
        return page.url, page
    except Exception as e:
        print(f'Error {e}: could not read url: {url}')
        page.response = None
        return url, page

def get_backlinks_df(item):
    lnks = item.links
    lnks_external = None
    if lnks is not None:
        lnks_external = list(set(lnks['external']))
        if len(lnks_external) == 0:
            return None
    bcklnk_df = pd.DataFrame({
        'from_resolved': item.resolved_url,
        'to_url': lnks_external})
    return bcklnk_df