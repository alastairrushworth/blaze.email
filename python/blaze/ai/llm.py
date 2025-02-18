import os
from openai import OpenAI
import json
import anthropic

def llm_router(query, model, system='', with_eval=False, **kwargs):
    '''Compute a completion with exponential backoff'''
    if model.startswith('gpt') or model.startswith('o'):
        client = OpenAI(
            api_key=os.environ['OPENAI_API_KEY']
            )
        # do not include system message for o1 models
        messages = []
        if not model.startswith('o1'):
            messages += [{"role": "system", "content": system}]
        messages += [{'role': 'user', 'content': query}]

        response = client.chat.completions.create(
            messages=messages,
            model=model,
            **kwargs
        )
        completion = response.choices[0].message.content
        if '```json' in completion:
            completion = completion.replace('```json', '')
        if '```python' in completion:
            completion = completion.replace('```python', '')
        if '```' in completion:
            completion = completion.replace('```', '')
    elif model.startswith('claude'):
        client = anthropic.Anthropic(
            api_key=os.environ['ANTHROPIC_API_KEY'],
        )
        response = client.messages.create(
            messages=[{"role": "user",  "content": query}], 
            model=model,
            max_tokens=2000,
            **kwargs
        )
        completion = response.content[0].text
    if with_eval:
        completion = json.loads(completion)
    return completion, response

def llm_completion(query, model, retry_model=None, system='', with_eval=False, **kwargs):
    try:
        completion, response = llm_router(query, model, system, with_eval=with_eval, **kwargs)
        return completion, response
    except Exception as e:
        print(f'Error: {e} could not complete query with {model}')
        if retry_model is None:
            raise e
        else:
            print(f'Error: {e} could not complete query with {model}, trying {retry_model}...')
            completion, response = llm_router(query, retry_model, system, with_eval=with_eval, **kwargs)
            return completion, response


