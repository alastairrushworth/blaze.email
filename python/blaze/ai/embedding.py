from openai import OpenAI
import voyageai
import os
import pandas as pd
import backoff
from ai.tokens import truncate_string_to_token_limit

# basic error handling
class APICallError(Exception):
    pass

def format_string_list(text_list: list) -> list:
    '''Format a list of strings for embedding'''
    # convert to list if input is a string
    if isinstance(text_list, str):
        _text_list = [text_list]
    else:
        _text_list = text_list.copy()
    # truncate long texts, if necessary
    _text_list = [truncate_string_to_token_limit(x, max_tokens=8191)
                    for x in text_list]
    return _text_list
    
@backoff.on_exception(backoff.constant, Exception, max_tries=2, interval=120)
def openai_embedding_create(input: list, **kwargs) -> list:
    '''Compute an embedding for a list of strings with exponential backoff'''
    openai_client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
    embedding = openai_client.embeddings.create(
        input=input, 
        model="text-embedding-ada-002", 
        **kwargs)
    embeds = [x.embedding for x in embedding.data]
    return embeds

@backoff.on_exception(backoff.constant, Exception, max_tries=2, interval=120)
def voyage_embedding_create(input: list, **kwargs) -> list:
    '''Compute an embedding for a list of strings with exponential backoff'''
    vo = voyageai.Client(api_key=os.environ['VOYAGE_API_KEY'])
    embeds = vo.embed(
        input, 
        model="voyage-3-large",
        **kwargs
    )
    return embeds.embeddings

def text_to_embedding(text_list: list, model: str = "openai", **kwargs) -> pd.DataFrame:
    '''Compute an embedding for a string or list of strings using the OpenAI API'''
    _text_list = format_string_list(text_list=text_list)
    # fetch embeddings from the appropriate model
    try:
        if model == "voyage":
            embeds = voyage_embedding_create(input=_text_list, **kwargs)
        elif model == "openai":
            embeds = openai_embedding_create(input=_text_list, **kwargs)  
        embed_df = pd.DataFrame(list(zip(_text_list, embeds)), columns=['input', 'embedding'])
    except Exception as e:
        raise APICallError(f'Error: {e} problem getting embedding. Text: {text_list}')
    return embed_df

def embed_from_dict(
        summary_dict: dict, 
        model: str = "openai", 
        value_name: str = "embedding", 
        **kwargs
        ) -> pd.DataFrame:
    '''Compute a dict of embeddings for a dict of summaries'''
    embed_dict = {}
    for k, v in summary_dict.items():
        if v:
            embed_dict[k] = [
                text_to_embedding([v], model=model, **kwargs).embedding[0]]
        else:
            embed_dict[k] = None
    # convert to dataframe with dict keys renamed to 'url'
    embed_df = pd.DataFrame(embed_dict).T \
        .rename_axis('url') \
        .rename(columns={0: value_name}) \
        .reset_index()
    return embed_df