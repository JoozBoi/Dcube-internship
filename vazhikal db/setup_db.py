#!/usr/bin/env python3
import sys
import subprocess
import os

# Ensure psycopg2 is installed
try:
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
except ImportError:
    print("Installing psycopg2-binary to connect and create the PostgreSQL database...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
        import psycopg2
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
    except Exception as e:
        print(f"Failed to automatically install psycopg2-binary: {e}")
        print("Please install it manually by running: pip install psycopg2-binary")
        sys.exit(1)

# Connection details matching user's request
DB_HOST = "localhost"
DB_PORT = "5432"
DB_USER = "postgres"
DB_PASSWORD = "password"
DB_NAME = "vazhikal_db"

def main():
    print("=============================================================")
    print("           vazhikal PostgreSQL Database Automator           ")
    print("=============================================================")
    
    # 1. Establish connection to default 'postgres' database to create the target database
    print(f"Connecting to default 'postgres' database on {DB_HOST}:{DB_PORT} as user '{DB_USER}'...")
    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
    except Exception as e:
        print(f"\n❌ ERROR: Could not connect to default postgres database.")
        print(f"Details: {e}")
        print("\nSuggestions:")
        print("1. Ensure PostgreSQL server is running on localhost (default port 5432).")
        print(f"2. Check if the username '{DB_USER}' is correct (standard is 'postgres', check if 'postgre' exists on your setup).")
        print("3. Check if password is correct.")
        sys.exit(1)

    # 2. Check if vazhikal_db exists; create if missing
    try:
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s;", (DB_NAME,))
        exists = cursor.fetchone()
        if not exists:
            print(f"Database '{DB_NAME}' does not exist. Creating it now...")
            cursor.execute(f'CREATE DATABASE {DB_NAME};')
            print(f"✓ Database '{DB_NAME}' created successfully.")
        else:
            print(f"Database '{DB_NAME}' already exists.")
    except Exception as e:
        print(f"❌ Error checking/creating database: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()

    # 3. Connect to vazhikal_db and create the 8 necessary tables
    print(f"\nConnecting directly to '{DB_NAME}' to initialize table structures...")
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = conn.cursor()
    except Exception as e:
        print(f"❌ Error connecting to '{DB_NAME}': {e}")
        sys.exit(1)

    # Define table creation SQL statements
    tables = {
        "users": """
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                uid VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) NOT NULL,
                username VARCHAR(255),
                role VARCHAR(255) DEFAULT 'traveller',
                password VARCHAR(255),
                bio TEXT,
                avatar TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """,
        "posts": """
            CREATE TABLE IF NOT EXISTS posts (
                id VARCHAR(255) PRIMARY KEY,
                author VARCHAR(255) NOT NULL,
                author_avatar VARCHAR(255),
                time_ago VARCHAR(255),
                location VARCHAR(255),
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                cost VARCHAR(255),
                duration VARCHAR(255),
                image_url TEXT,
                image_alt TEXT,
                votes INTEGER DEFAULT 0,
                comments_count INTEGER DEFAULT 0,
                difficulty VARCHAR(255),
                day_by_day JSON DEFAULT '[]'::json,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """,
        "comments": """
            CREATE TABLE IF NOT EXISTS comments (
                id VARCHAR(255) PRIMARY KEY,
                post_id VARCHAR(255) NOT NULL,
                parent_id VARCHAR(255),
                author VARCHAR(255) NOT NULL,
                author_avatar VARCHAR(255),
                time_ago VARCHAR(255),
                votes INTEGER DEFAULT 0,
                text TEXT NOT NULL,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """,
        "packages": """
            CREATE TABLE IF NOT EXISTS packages (
                id VARCHAR(255) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                destination VARCHAR(255),
                duration VARCHAR(255),
                agency_name VARCHAR(255) NOT NULL,
                agency_logo TEXT,
                is_verified_agency BOOLEAN DEFAULT FALSE,
                image_url TEXT,
                image_alt TEXT,
                price INTEGER DEFAULT 0,
                status VARCHAR(255) DEFAULT 'Active',
                description TEXT,
                inclusions JSON DEFAULT '[]'::json,
                stay_name_text VARCHAR(255),
                stay_desc_text TEXT,
                stay_rating VARCHAR(255) DEFAULT '4.5',
                stay_reviews_count INTEGER DEFAULT 0,
                stay_value INTEGER DEFAULT 0,
                day_by_day JSON DEFAULT '[]'::json,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """,
        "verifications": """
            CREATE TABLE IF NOT EXISTS verifications (
                id VARCHAR(255) PRIMARY KEY,
                company_name VARCHAR(255) NOT NULL,
                submitted_at VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(255),
                files_count INTEGER DEFAULT 0,
                status VARCHAR(255) DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """,
        "flagged_posts": """
            CREATE TABLE IF NOT EXISTS flagged_posts (
                id VARCHAR(255) PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                user_avatar VARCHAR(255),
                time_ago VARCHAR(255),
                type VARCHAR(255),
                content TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """,
        "comment_reports": """
            CREATE TABLE IF NOT EXISTS comment_reports (
                id VARCHAR(255) PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                post_id VARCHAR(255),
                post_title VARCHAR(255),
                text TEXT NOT NULL,
                reports_count INTEGER DEFAULT 1,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """,
        "audit_logs": """
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                entity_type VARCHAR(255) NOT NULL,
                entity_id VARCHAR(255) NOT NULL,
                action VARCHAR(255) NOT NULL,
                performed_by VARCHAR(255) NOT NULL,
                details TEXT,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """
    }

    # Execute schemas
    for tablename, query in tables.items():
        try:
            cursor.execute(query)
            conn.commit()
            print(f"✓ Table '{tablename}' verified/created.")
        except Exception as e:
            conn.rollback()
            print(f"❌ Failed to create table '{tablename}': {e}")
            sys.exit(1)

    print("\n✓ PostgreSQL database schema and tables successfully generated!")

    # 4. Generate/Update the local .env configuration file
    env_file_path = ".env"
    env_data = f"""# Server & Environment details
PORT=3000
NODE_ENV=development

# SQL Database Credentials (configured from setup_db.py)
SQL_HOST={DB_HOST}
SQL_PORT={DB_PORT}
SQL_DB_NAME={DB_NAME}
SQL_USER={DB_USER}
SQL_PASSWORD={DB_PASSWORD}

# Optional Gemini AI Secret Key (set your real key here)
GEMINI_API_KEY=""
"""
    
    try:
        # Check if .env configuration already exists; write if missing
        if not os.path.exists(env_file_path):
            with open(env_file_path, "w") as env_f:
                env_f.write(env_data)
            print("✓ Generated a fresh local '.env' file with your specified database credentials!")
        else:
            print("⚠️ A '.env' file already exists in your workspace. We didn't overwrite it to protect your existing secrets.")
            print(f"Please verify your '.env' contains these coordinates:")
            print(f"  SQL_HOST={DB_HOST}")
            print(f"  SQL_PORT={DB_PORT}")
            print(f"  SQL_DB_NAME={DB_NAME}")
            print(f"  SQL_USER={DB_USER}")
            print(f"  SQL_PASSWORD={DB_PASSWORD}")
    except Exception as e:
        print(f"⚠️ Could not write '.env' file: {e}")

    print("\nAll database pre-requisites are complete!")
    print("Simply kickstart your development server by running 'npm run dev'.")
    print("On the very first startup, the server will automatically seed the")
    print("tables with stunning travel mock data and start-up audit traces!")
    print("=============================================================")

    if conn:
        conn.close()

if __name__ == "__main__":
    main()
