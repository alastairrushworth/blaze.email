import tiktoken

## -----------------------------------------
## token counting and string splitting tools
## -----------------------------------------

def count_tokens(text, model="gpt-3.5-turbo"):
    '''Count the number of tokens in a string.'''
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

def truncate_string_to_token_limit(
        string, model="gpt-3.5-turbo", max_tokens=4096):
    '''Truncate a string to a given number of tokens.'''
    token_count = count_tokens(string, model=model)
    while token_count > max_tokens:
        string_split = string.split()
        string_word_count = len(string_split)
        if token_count > (max_tokens * 2):
            split_jump = int(0.5 * string_word_count)
        else:
            split_jump = 100
        string = ' '.join(string_split[:(string_word_count - split_jump)])
        token_count = count_tokens(string, model=model)
    return string

def truncate_to_token_limit(
        context, prompt, response_tokens, model="gpt-3.5-turbo", max_tokens=4096):
    '''Truncate a combined context and prompt to a given number of tokens
        allowing space for the response.
    '''
    input_token_budget = max_tokens - response_tokens
    token_count = count_tokens(prompt.format(context), model=model)
    while token_count > input_token_budget:
        context_split = context.split()
        context_word_count = len(context_split)
        if token_count > (input_token_budget * 2):
            split_jump = int(0.5 * input_token_budget)
        else:
            split_jump = 100
        context = ' '.join(context_split[:(context_word_count - split_jump)])
        token_count = count_tokens(prompt.format(context), model=model)
    query = prompt.format(context)
    return query
