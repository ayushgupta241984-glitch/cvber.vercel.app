import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

url = os.environ['SUPABASE_URL']
project_ref = url.replace('https://','').split('.')[0]
pw = os.environ['SUPABASE_SERVICE_ROLE_KEY']

# Supabase transaction pooler - uses service role key as password
conn_str = f"postgresql://postgres.{project_ref}:{pw}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"

try:
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    cur = conn.cursor()
    
    sql = open('migrations/04_ai_art_dna.sql').read()
    cur.execute(sql)
    print("Migration applied successfully!")
    
    for t in ['style_embeddings', 'dna_analysis_results', 'dna_notifications']:
        cur.execute("SELECT to_regclass('public." + t + "')")
        result = cur.fetchone()[0]
        print(f"  {t}: {result}")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Connection error: {e}")
