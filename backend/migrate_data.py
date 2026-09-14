"""
Migration script: Render PostgreSQL -> Supabase PostgreSQL
Transfers all users, profiles, skills, projects, connected accounts, and telemetry.
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text

def clean_url(url: str) -> str:
    url = url.strip()
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://") and not url.startswith("postgresql+"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url

def migrate(render_url: str, supabase_url: str):
    print("\n" + "="*60)
    print("SkillSync AI: Render to Supabase Data Migration")
    print("="*60)

    clean_render = clean_url(render_url)
    clean_supabase = clean_url(supabase_url)

    print("\nConnecting to Render (Source Database)...")
    try:
        src_engine = create_engine(clean_render, pool_pre_ping=True)
        with src_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Connected to Render PostgreSQL successfully.")
    except Exception as e:
        print(f"Failed to connect to Render: {e}")
        return

    print("\nConnecting to Supabase (Destination Database)...")
    try:
        dst_engine = create_engine(clean_supabase, pool_pre_ping=True)
        with dst_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Connected to Supabase PostgreSQL successfully.")
    except Exception as e:
        print(f"Failed to connect to Supabase: {e}")
        return

    # Ensure tables exist in destination
    print("\nEnsuring all tables exist in Supabase...")
    from app.db.session import Base
    import app.models
    Base.metadata.create_all(bind=dst_engine)
    print("All Supabase tables verified.")

    # Tables in order of foreign key dependencies
    TABLES = [
        "users",
        "student_profiles",
        "connected_accounts",
        "platform_stats",
        "skills",
        "skill_gaps",
        "projects",
        "achievements",
        "recommendations",
        "notifications",
        "resume_data",
    ]

    total_migrated = 0

    with src_engine.connect() as src_conn, dst_engine.connect() as dst_conn:
        for table_name in TABLES:
            try:
                # Read all rows from Render
                result = src_conn.execute(text(f"SELECT * FROM {table_name}"))
                rows = result.mappings().all()

                if not rows:
                    print(f"- {table_name}: 0 records found (Skipping)")
                    continue

                # Build dynamic insert statement
                cols = list(rows[0].keys())
                cols_str = ", ".join([f'"{c}"' for c in cols])
                placeholders = ", ".join([f":{c}" for c in cols])
                
                # Primary key conflict handling
                conflict_col = "id" if "id" in cols else cols[0]
                insert_sql = text(
                    f'INSERT INTO {table_name} ({cols_str}) VALUES ({placeholders}) '
                    f'ON CONFLICT ("{conflict_col}") DO UPDATE SET '
                    + ", ".join([f'"{c}" = EXCLUDED."{c}"' for c in cols if c != conflict_col])
                )

                count = 0
                for row in rows:
                    dst_conn.execute(insert_sql, dict(row))
                    count += 1
                dst_conn.commit()

                print(f"+ {table_name}: Migrated {count} record(s)!")
                total_migrated += count

                # Update postgres auto-increment serial sequence if 'id' exists
                if "id" in cols:
                    try:
                        dst_conn.execute(text(
                            f"SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), "
                            f"COALESCE((SELECT MAX(id) FROM {table_name}), 1) + 1, false)"
                        ))
                        dst_conn.commit()
                    except Exception:
                        pass

            except Exception as e:
                print(f"Error migrating table '{table_name}': {e}")

    print("\n" + "="*60)
    print(f"MIGRATION COMPLETE: Copied {total_migrated} records into Supabase!")
    print("All previous logins, profiles, and statistics are now active in Supabase.")
    print("="*60 + "\n")

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        r_url = sys.argv[1]
        s_url = sys.argv[2]
    else:
        print("\nEnter Database URLs to migrate:\n")
        r_url = input("1. Paste Render External Database URL: ").strip()
        s_url = input("2. Paste Supabase Pooler URL: ").strip()

    if not r_url or not s_url:
        print("Error: Both database URLs are required.")
        sys.exit(1)

    migrate(r_url, s_url)
