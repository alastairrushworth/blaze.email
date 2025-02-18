'''Tools to interact with the pinecone API.'''
import pandas as pd
from pinecone import Pinecone
import numpy as np
import os
from ..ai.embedding import text_to_embedding
import time
import re


class PineCone:
    '''
    Wrapper class for pinecone API.
    '''
    def __init__(self, index_prefix: str = "PINECONE_V2"):
        self.index_prefix = index_prefix
        self.namespace = os.environ[self.index_prefix + '_INDEX']
        pc = Pinecone(api_key=os.environ['PINECONE_API_KEY'])
        self.pc_index = pc.Index(host=os.environ[self.index_prefix + '_HOST'])

    def ids_in_index(self, ids: list):
        '''Check whether a list of ids are in the pinecone index.'''
        response = self.pc_index.fetch(ids=ids, namespace=self.namespace)
        return list(response['vectors'].keys())
    
    def delete_namespace(self):
        '''Delete all vectors in a namespace.'''
        self.pc_index.delete(deleteAll='true', namespace=self.namespace)
    
    def query(
            self,
            filter: dict = {},
            text=None,
            embedding_vec=None,
            to_df=False,
            neg=None,
            include_metadata=True,
            **kwargs
            ):
        '''Generic query function for pinecone'''
        if (embedding_vec is None) and (text is None):
            raise Exception('Must provide either text or embedding_vec')
        
        # get embedding of query text
        if (embedding_vec is None):
            text = [text] if not isinstance(text, list) else text
            embedding = text_to_embedding(text, model='voyage', input_type='query')
            if neg is not None:
                neg_embedding = text_to_embedding(neg, model='voyage', input_type='query')
                neg_embedding_vec = neg_embedding.embedding[0]
                embedding_vec = list(np.array(embedding_vec) - 0.5*np.array(neg_embedding_vec))
            embedding_vec = embedding.embedding[0]

        # query pinecone
        res = self.pc_index.query(
            vector=embedding_vec,
            include_metadata=include_metadata,
            filter=filter,
            **kwargs
            )
        # convert to dataframe if requested
        if to_df:
            res = pd.DataFrame(
                [
                    {'url': x['id'], **x['metadata'], 'pcscore': x['score'], 'values': x['values']} 
                    for x in res['matches']
                ]
            )
        return res


def upsert_df(
        df,
        embedding_col,
        metadata_cols,
        index_col,
        namespace=None,
        index_prefix=None):
    # replace all instances of None in object columns with empty string
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(0)
    string_cols = df.select_dtypes(include=[object]).columns
    df[string_cols] = df[string_cols].fillna('')

    # pull out the index column
    index = df[index_col]
    # pull out the metadata columns, reform to dict
    metadata = df[metadata_cols] \
        .rename(columns={'input': 'text'}) \
        .to_dict(orient='records')
    # pull out the embedding column
    values = df[embedding_col]
    # set as dataframe and turn into dict
    for_upsert = pd.DataFrame({
        'id': index,
        'metadata': metadata,
        'values': values
        })
    for_upsert = for_upsert \
        .to_dict(orient='records')
    # upsert to pinecone
    if index_prefix is not None:
        pinecone = PineCone(index_prefix=index_prefix)
        for item in for_upsert:
            try:
                pinecone.pc_index.upsert(
                    [item], 
                    namespace=namespace if namespace else pinecone.namespace
                    )
            except Exception as e:
                print(f'Error writing to pinecone {item["id"]}: {e}: ')
                print(item)
                pass
            print(f'Wrote {item["id"]} to pinecone')
    return for_upsert


type_dict = {
    'news': 'news',
    'academic': 'academic',
    'arxiv': 'academic',
    'arxiv.org': 'academic',
    'papers': 'academic',
    'journals': 'academic',
    'blog': 'blog',
    'blogs': 'blog',
}

stype_dict = {
    'blog': ['blog', 'individual / personal blog'],
    'adult': ['adult / nsfw site'],
    'periodic': ['periodic newsletter digest'],
    'eng': ['company engineering blog'],
    'news': ['news / media publication']
}

since_dict = {
    'yesterday': 24 * 60 * 60,
    'last_3days': 3 * 24 * 60 * 60,
    'last_week': 7 * 24 * 60 * 60,
    'last_month': 30 * 24 * 60 * 60,
    'last_3months': 3 * 30 * 24 * 60 * 60,
    'last_year': 365 * 24 * 60 * 60,
}

def search_pc(qry, nmax, stype=None):
    pc = PineCone()
    if 'type:feeds' in qry:
        qry = qry.replace('type:feeds', '')
        print('fetching feeds...')
        xx, time_taken = search_feeds(
            qry=qry,
            pc=pc,
            nmax=nmax
            )
    else:
        xx, time_taken = search_content(
            qry=qry,
            pc=pc,
            nmax=nmax,
            stype=stype
            )
    return xx, time_taken


def search_feeds(qry, pc, nmax):
    startx = time.time()
    if isinstance(qry, str):
        z = pc.query(
            namespace='blaze-feeds-v2', 
            text=qry,
            include_values=False,
            to_df=True,
            top_k=nmax, 
        )
    else:
        z = pc.query(
            namespace='blaze-feeds-v2', 
            embedding_vec=qry,
            include_values=False,
            to_df=True,
            top_k=nmax, 
        )
    # stop timers
    endx = time.time()
    time_taken = endx - startx

    # clean up results
    xx = z \
        .assign(title = lambda x: x.owner_name + ' (' + x.baseurl + ')') \
        .drop_duplicates(subset=['baseurl'], keep='first') \
        .sort_values(by='pcscore', ascending=False) \
        .assign(pcscore = lambda x: x.pcscore.round(3)) \
        .reset_index(drop=True) \
        .rename(columns={'baseurl': 'basedomain', 'rss': 'url', 'short_summary': 'subtitle'}) \
        .assign(url = lambda x: x.basedomain) \
        .assign(date = '')

    # final cleanup
    xx = xx.reset_index(drop=True)
    return xx, time_taken


def search_content(qry, pc, nmax, stype=None):
    qry_raw = qry
    # is stype is not None, add to filter
    filter = {}
    if stype is not None:
        if stype not in ['', 'everything']:
            filter.update({'rsstype': {'$eq': type_dict[stype]}})

    # parse type: from searchx
    if 'type:' in qry:
        type_arg = re.search('type:(.*?)( |$)', qry).group(0)
        stype = type_arg.replace('type:', '').strip()
        qry = qry.replace(type_arg, '').strip()
        if stype not in ['', 'everything']:
            filter.update({'rsstype': {'$eq': type_dict[stype]}})

    if 'sype:' in qry:
        type_arg = re.search('sype:(.*?)( |$)', qry).group(0)
        stype = type_arg.replace('sype:', '').strip()
        qry = qry.replace(type_arg, '').strip()
        if stype not in ['', 'everything']:
            filter.update({'site_type': {'$in': stype_dict[stype]}}) 
    
    if 'oype:' in qry:
        type_arg = re.search('oype:(.*?)( |$)', qry).group(0)
        stype = type_arg.replace('oype:', '').strip()
        qry = qry.replace(type_arg, '').strip()
        if stype not in ['', 'everything']:
            if stype == 'individual':
                filter.update({'owner_type': {'$eq': stype}}) 
            else:
                filter.update({'owner_type': {'$ne': 'individual'}})

    # parse since: from searchx
    if 'since:' in qry:
        since_arg = re.search('since:(.*?)( |$)', qry).group(0)
        since = since_arg.replace('since:', '').strip()
        qry = qry.replace(since_arg, '').strip()
        if since in since_dict.keys():
            filter.update({'unix_time': {'$gt': time.time() - since_dict[since]}})

    # parse base_url: from searchx
    if 'site:' in qry:
        base_url_arg = re.search('site:(.*?)( |$)', qry).group(0)
        base_url = base_url_arg.replace('site:', '').strip()
        qry = qry.replace(base_url_arg, '').strip()
        filter.update({'base_url': {'$eq': base_url}})

    # parse lang: from searchx
    if 'lang:' in qry:
        lang_arg = re.search('lang:(.*?)( |$)', qry).group(0)
        lang = lang_arg.replace('lang:', '').strip()
        qry = qry.replace(lang_arg, '').strip()
        filter.update({'lang': {'$eq': lang}})

    # parse score: from searchx
    if ('score:' in qry) and (stype != 'academic'):
        score_arg = re.search('score:(.*?)( |$)', qry).group(0)
        score = score_arg.replace('score:', '').strip()
        qry = qry.replace(score_arg, '').strip()
        filter.update({'score': {'$gt': float(score)}})

    # parse length: from searchx
    if 'length:' in qry:
        length_arg = re.search('length:(.*?)( |$)', qry).group(0)
        length = length_arg.replace('length:', '').strip()
        qry = qry.replace(length_arg, '').strip()
        filter.update({'length': {'$gt': float(length)}})

    # parse like: from searchx
    if 'like:' in qry:
        like_arg = re.search('like:(.*?)( |$)', qry).group(0)
        like = like_arg.replace('like:', '').strip()
        vec = pc.pc_index.fetch(ids=[like], namespace=pc.namespace)
        qry = vec['vectors'][like].values

    # parse - from searchx
    if ' <' in qry:
        # find neg args in the format between quotes '"' and '"'
        neg_arg = re.search(r"<(.*?)>", qry).group(0)
        neg = neg_arg.replace('<', '').strip()
        neg = neg.replace('>', '').strip()
        qry = qry.replace(neg_arg, '').strip()
        print('negation:', neg)
    else:
        neg = None

    # parse sort: from searchx
    sort = None
    if 'sort:' in qry:
        sort_arg = re.search('sort:(.*?)( |$)', qry).group(0)
        sort = sort_arg.replace('sort:', '').strip()
        qry = qry.replace(sort_arg, '').strip()

    if not 'like:' in qry_raw:
        print(f'query: {qry}')
    else:
        print(f'query: like:{like}')
    print(f'filter: {filter}')
    # start timers    
    startx = time.time()

    if qry == '' or qry == ['']:
        qry = 'a'
    if isinstance(qry, str):
        z = pc.query(
            namespace=pc.namespace, 
            text=qry,
            include_values=False,
            to_df=True,
            filter=filter,
            top_k=nmax, 
            neg=neg
        )
    else:
        z = pc.query(
            namespace=pc.namespace, 
            embedding_vec=qry,
            include_values=False,
            to_df=True,
            filter=filter,
            top_k=nmax, 
            neg=neg
        )

    # stop timers
    endx = time.time()
    time_taken = endx - startx

    if z.shape[0] > 0:
        # clean up results
        xx = z \
            .assign(title = lambda x: x.title.str.replace('\n', ' ')) \
            .drop_duplicates(subset=['title'], keep='first') \
            .sort_values(by='pcscore', ascending=False) \
            .assign(dt_published = lambda x: pd.to_datetime(x.dt_published, utc=True, format='mixed')) \
            .assign(date = lambda x: x.dt_published.dt.strftime('%d-%m-%Y')) \
            .assign(pcscore = lambda x: x.pcscore.round(3)) \
            .reset_index(drop=True) \
            .rename(columns={'base_url': 'basedomain'})
        
        # sort by time if requested
        if sort == 'time':
            xx = xx.sort_values(by='dt_published', ascending=False)

        # final cleanup
        xx = xx.reset_index(drop=True)
    else:
        xx = z.copy()
    return xx, time_taken