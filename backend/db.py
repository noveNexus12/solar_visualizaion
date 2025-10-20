# db.py
import mysql.connector

def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='incorrect@11',
        database='solar_dashboard'
    )
