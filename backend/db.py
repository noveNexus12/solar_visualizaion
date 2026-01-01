# db.py
import os
import mysql.connector


def get_db_connection():
    """Return a MySQL connection using environment variables with sensible defaults.

    Set the following environment variables to override defaults:
    - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
    """
    host = os.getenv('DB_HOST', 'localhost')
    user = os.getenv('DB_USER', 'TechnovXP')
    password = os.getenv('DB_PASSWORD', 'TechnnovXp2025')
    database = os.getenv('DB_NAME', 'solar_dashboard')

    try:
        return mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
        )
    except mysql.connector.Error as e:
        # Raise a clearer runtime error so the Flask logs show a readable message
        raise RuntimeError(f"Database connection failed ({e.errno}): {e.msg}") from e
