import psycopg2
from psycopg2.extras import execute_values
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import pandas as pd
from sqlalchemy import create_engine
from datetime import timedelta
from ..utils.tools import time_now
import os

pg_host = os.environ['PG_HOST']
pg_port = os.environ['PG_PORT']
pg_username = os.environ['PG_USERNAME']
pg_password = os.environ['PG_PASSWORD']
pg_dbname = os.environ['PG_DATABASE']

class PG():
    def __init__(self):
        pass
        
    def execute(self, query):
        conn = _open_connection()
        cur = conn.cursor()
        # Execute a SQL statement
        cur.execute(query)
        # Commit the changes to the database
        conn.commit()
        # Close the cursor and the database connection
        cur.close()
        conn.close()

    def drop_table(self, table_name):
        conn = _open_connection()
        cur = conn.cursor()
        # Define the DELETE statement
        delete_table_query = f"DROP TABLE IF EXISTS {table_name};"
        # Execute the DELETE statement
        cur.execute(delete_table_query)
        # Commit the changes to the database
        conn.commit()
        # Close the cursor and the database connection
        cur.close()
        conn.close()
    
    def insert_df(self, table_name, df):
        engine = _start_engine()
        df.to_sql(name=table_name, con=engine, if_exists='append', index=False)
        engine.dispose()

    def upsert_df(self, df, table_name, unique_columns):
        conn = _open_connection()
        # Create a cursor
        cur = conn.cursor()
        # Get the column names from the dataframe
        columns = df.columns.tolist()
        # Prepare the data
        data_values = [tuple(x) for x in df.to_numpy()]
        # ensure any NaNs in the tuples are converted to None
        data_values = [tuple(None if pd.isnull(x) else x for x in tup) for tup in data_values]
        # Create a temporary table
        temp_table = f"temp_{table_name}"
        cur.execute(f"CREATE TEMP TABLE {temp_table} (LIKE {table_name} INCLUDING ALL)")
        # Insert data into the temporary table
        insert_query = f"INSERT INTO {temp_table} ({', '.join(columns)}) VALUES %s"
        execute_values(cur, insert_query, data_values)
        # Prepare the UPDATE statement
        update_columns = [col for col in columns if col not in unique_columns]
        update_stmt = ", ".join([f"{col} = {temp_table}.{col}" for col in update_columns])
        where_clause = " AND ".join([f"{table_name}.{col} = {temp_table}.{col}" for col in unique_columns])
        # Perform UPDATE
        update_query = f"""
        UPDATE {table_name}
        SET {update_stmt}
        FROM {temp_table}
        WHERE {where_clause}
        """
        cur.execute(update_query)
        # Perform INSERT for new rows
        insert_where_clause = " AND ".join([f"{temp_table}.{col} IS NOT NULL" for col in unique_columns])
        not_exists_clause = " AND ".join([f"NOT EXISTS (SELECT 1 FROM {table_name} WHERE {where_clause})" for col in unique_columns])
        insert_query = f"""
        INSERT INTO {table_name} ({', '.join(columns)})
        SELECT {', '.join(columns)}
        FROM {temp_table}
        WHERE {insert_where_clause}
        AND {not_exists_clause}
        """
        cur.execute(insert_query)
        # Drop the temporary table
        cur.execute(f"DROP TABLE {temp_table}")
        # Commit the transaction
        conn.commit()
        # Close the cursor
        cur.close()
    
    def head(self, table_name, n=5):
        engine = _start_engine()
        # Define the SELECT statement
        select_query = f"SELECT * FROM {table_name} LIMIT {n}"
        # Execute the SELECT statement
        df = pd.read_sql(select_query, engine)
        engine.dispose()
        return df

    def delete_rows(self, table_name, where):
        conn = _open_connection()
        cur = conn.cursor()
        # Define the DELETE statement
        if where:
            delete_query = f"DELETE FROM {table_name} WHERE {where}"
        else:
            delete_query = f"DELETE FROM {table_name}"
        # Execute the DELETE statement
        cur.execute(delete_query)
        # Commit the changes to the database
        conn.commit()
        # Close the cursor and the database connection
        cur.close()
        conn.close()

    def list_tables(self):
        conn = _open_connection()
        cur = conn.cursor()
        # Define the SELECT statement
        select_query = "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
        # Execute the SELECT statement
        cur.execute(select_query)
        # Retrieve the tables
        tables = cur.fetchall()
        # Print the tables
        for table in tables:
            # get table row + col shape
            table_shape = self.query(f"SELECT COUNT(*) FROM {table[0]}")
            print(f"{table[0]}: {table_shape.iloc[0,0]} rows")
        # Close the cursor and the database connection
        cur.close()
        conn.close()

    def list_columns(self, table_name):
        conn = _open_connection()
        cur = conn.cursor()
        # Define the SELECT statement
        select_query = f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name}'"
        # Execute the SELECT statement
        cur.execute(select_query)
        # Retrieve the tables
        columns = cur.fetchall()
        # Print the tables
        for column in columns:
            print(column)
        # Close the cursor and the database connection
        cur.close()
        conn.close()
    
    def query(self, query, params=None):
        # engine = _start_engine()
        conn = _start_engine()
        # Execute the SELECT statement
        # df = pd.read_sql(query, engine)
        # Read the result directly into a DataFrame
        df = pd.read_sql_query(query, conn, params=params)
        return df
    
    def housekeeper(self, table):
        conn = _open_connection()
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        # Define the VACUUM statement
        vacuum_query = f"VACUUM FULL {table}"
        # Execute the VACUUM statement
        cur.execute(vacuum_query)
        # Commit the changes to the database
        conn.commit()
        # Define the ANALYZE statement
        analyze_query = f"ANALYZE {table}"
        # Execute the ANALYZE statement
        cur.execute(analyze_query)
        # Commit the changes to the database
        conn.commit()
        # Close the cursor and the database connection
        cur.close()
        conn.close()

    def schema(self, table):
        df = self.query(
            f'''
            SELECT column_name, data_type, character_maximum_length, is_nullable
            FROM information_schema.columns
            WHERE table_name = '{table}';
            '''
        )
        return df
    

def _open_connection():
    conn = psycopg2.connect(
        host=pg_host,
        database=pg_dbname,
        user=pg_username,
        password=pg_password,
        port=pg_port
    )
    return conn

def _start_engine():
    engine = create_engine(
        f"postgresql://{pg_username}:{pg_password}@{pg_host}"
        f":{pg_port}/{pg_dbname}"
    )
    return engine

def url_in_table(url_list, table_name):
    # if url_list is a string, convert to list
    if isinstance(url_list, str):
        url_list = [url_list]
    # double apostrophes in urls
    url_list = [url.replace("'", "''") for url in url_list]
    # combine urls into a single string
    url_str = "'" + "','".join(url_list) + "'"
    conn = _open_connection()
    cur = conn.cursor()
    # Define the SELECT statement
    select_query = f'''
        SELECT distinct(url) 
        FROM {table_name}
        WHERE url in ({url_str}) or resolved_url in ({url_str})
    '''
    # Execute the SELECT statement
    cur.execute(select_query)
    # Retrieve the tables
    entries = cur.fetchall()
    # Close the cursor and the database connection
    cur.close()
    conn.close()
    # if entries is empty return []
    if len(entries) == 0:
        entries = []
    else:
        # return a list of urls
        entries = [e[0] for e in entries]
    return entries


def get_feed_list(last_checked, type, url=None):
    # Get the datetime 7 days ago
    n_days_ago = (time_now() - timedelta(days=last_checked)) \
        .strftime("%Y-%m-%d %H:%M:%S")
    pg = PG()
    qry = f'''
        WITH rc AS (
            SELECT DISTINCT(rss)
            FROM blaze_feeds_checked
            WHERE dt_checked > '{n_days_ago}'
            )
        SELECT *
        FROM blaze_feeds_detailed as bf
        WHERE'''
    if url:
        qry += f" bf.rss = '{url}'"
    else:
        qry += f'''
                (bf.rss IS NOT NULL) AND
                (bf.rss != '') AND
                (bf.rss NOT IN (select rss from rc)) AND
                (bf.type = '{type}') AND 
                (bf.include = True) AND
                (bf.status = 'ok')
        '''
        
    # get feeds, deduplicate and shuffle
    feed_df = pg.query(qry) \
        .drop_duplicates(subset=['rss']) \
        .sample(frac=1) \
        .reset_index(drop=True)
    # return list of feeds and dataframe
    return feed_df.rss.tolist(), feed_df