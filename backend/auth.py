from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from db import get_db_connection

SECRET_KEY = "supersecretkey"  # change this for production

auth_bp = Blueprint('auth', __name__)

# -------------------------------
# 🔹 SIGN UP
# -------------------------------
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    print("Received signup data:", data)  # DEBUG

    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400

    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    role = data.get('role', 'technician')  # default role

    if not all([name, email, phone, password]):
        return jsonify({'error': 'All fields are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Check if email already exists
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Email already registered'}), 400

    # Store user
    password_hash = generate_password_hash(password)
    cursor.execute("""
        INSERT INTO users (name, email, phone, password_hash, role)
        VALUES (%s, %s, %s, %s, %s)
    """, (name, email, phone, password_hash, role))
    conn.commit()
    conn.close()

    return jsonify({'message': 'User registered successfully'}), 201

# -------------------------------
# 🔹 SIGN IN
# -------------------------------
@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    print("Received signin payload:", data)  # <-- log it
    print("Received signin data:", data)  # DEBUG

    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid credentials'}), 401

    # Generate JWT token
    token = jwt.encode({
        'user_id': user['id'],
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=6)
    }, SECRET_KEY, algorithm='HS256')

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'role': user['role']
    })
