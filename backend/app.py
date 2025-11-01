from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from auth import auth_bp
from db import get_db_connection
from iot_routes import iot_bp
import datetime
import io
import csv

app = Flask(__name__)

# ✅ CORS for frontend (React/Vite/Other Dev Servers)
CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:5173",
    "http://localhost:8080",  # Vue/React alt
    "http://127.0.0.1:8080"
]}}, supports_credentials=True)

# ✅ Register authentication routes
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(iot_bp)


# =====================================================================
# 🏗 API ROUTES
# =====================================================================

@app.route('/api/poles', methods=['GET'])
def get_poles():
    """Fetch all poles from DB"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            pole_id, cluster_id, latitude, longitude,
            status, communication_status, state, district,
            city_or_village, mode, firmware_version, update_time
        FROM poles
    """)
    data = cursor.fetchall()
    conn.close()

    now = datetime.datetime.utcnow()
    for row in data:
        if row['update_time']:
            row['update_time'] = row['update_time'].isoformat()

        display_status = row.get('communication_status', 'OFFLINE')

        if row['communication_status'] == 'OFFLINE' and row['update_time']:
            update_time = datetime.datetime.fromisoformat(row['update_time'])
            diff_days = (now - update_time).days
            display_status = 'MAINTENANCE' if diff_days < 3 else 'OFFLINE'
        elif row['communication_status'] == 'ONLINE':
            display_status = 'ONLINE'

        row['display_status'] = display_status

    return jsonify(data)


@app.route('/api/poles/<pole_id>', methods=['GET'])
def get_pole_details(pole_id):
    """Fetch a single pole’s details"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            pole_id, cluster_id, latitude, longitude,
            status AS device_status, communication_status,
            state, district, city_or_village, mode,
            firmware_version, update_time
        FROM poles
        WHERE pole_id = %s
    """, (pole_id,))

    data = cursor.fetchone()
    conn.close()

    if not data:
        return jsonify({"error": "Pole not found"}), 404

    if data['update_time']:
        data['update_time'] = data['update_time'].isoformat()

    now = datetime.datetime.utcnow()
    display_status = data['communication_status']

    if data['communication_status'] == 'OFFLINE' and data['update_time']:
        update_time = datetime.datetime.fromisoformat(data['update_time'])
        diff_days = (now - update_time).days
        display_status = 'MAINTENANCE' if diff_days < 3 else 'OFFLINE'
    elif data['communication_status'] == 'ONLINE':
        display_status = 'ONLINE'

    data['display_status'] = display_status
    return jsonify(data)


@app.route('/api/telemetry', methods=['GET'])
def get_telemetry():
    """Fetch telemetry data"""
    pole_id = request.args.get('pole_id')
    mode = request.args.get('mode', 'filtered')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if pole_id:
        if mode == 'filtered':
            cursor.execute("""
                SELECT pole_id, status, signal_strength, timestamp
                FROM telemetry_data
                WHERE pole_id = %s
                  AND (TIME(timestamp) BETWEEN '06:30:00' AND '07:00:00'
                       OR TIME(timestamp) BETWEEN '18:00:00' AND '18:30:00')
                ORDER BY timestamp DESC
            """, (pole_id,))
        else:
            cursor.execute("""
                SELECT pole_id, status, signal_strength, timestamp
                FROM telemetry_data
                WHERE pole_id = %s
                ORDER BY timestamp DESC
                LIMIT 24
            """, (pole_id,))
    else:
        cursor.execute("""
            SELECT pole_id, status, signal_strength, timestamp
            FROM telemetry_data
            WHERE (TIME(timestamp) BETWEEN '06:30:00' AND '07:00:00')
               OR (TIME(timestamp) BETWEEN '18:00:00' AND '18:30:00')
            ORDER BY timestamp DESC
        """)

    data = cursor.fetchall()
    conn.close()

    for row in data:
        if row['timestamp']:
            row['timestamp'] = row['timestamp'].isoformat()

    return jsonify(data)


@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Fetch recent alerts"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT pole_id, message, severity, alert_status,
               alert_type, technician_id, action_taken,
               remarks, timestamp
        FROM alerts
        ORDER BY timestamp DESC
        LIMIT 10
    """)

    data = cursor.fetchall()
    conn.close()

    for row in data:
        if row['timestamp']:
            row['timestamp'] = row['timestamp'].isoformat()

    return jsonify(data)


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Dashboard summary"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(*) AS total FROM poles")
    total = cursor.fetchone().get('total', 0)

    cursor.execute("SELECT COUNT(*) AS active FROM poles WHERE status='ON'")
    active = cursor.fetchone().get('active', 0)

    cursor.execute("SELECT COUNT(*) AS inactive FROM poles WHERE status='OFF'")
    inactive = cursor.fetchone().get('inactive', 0)

    cursor.execute("SELECT COUNT(*) AS alerts FROM alerts WHERE alert_status='ACTIVE'")
    alerts = cursor.fetchone().get('alerts', 0)

    conn.close()
    return jsonify({
        "total": total,
        "active": active,
        "inactive": inactive,
        "alerts": alerts
    })


@app.route('/api/export/<table_name>', methods=['GET'])
def export_csv(table_name):
    """Export table to CSV"""
    valid_tables = {
        'telemetry': 'telemetry_data',
        'alerts': 'alerts',
        'poles': 'poles'
    }

    if table_name not in valid_tables:
        return jsonify({'error': 'Invalid dataset'}), 400

    start_date = request.args.get('start')
    end_date = request.args.get('end')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = f"SELECT * FROM {valid_tables[table_name]}"
    params = []

    if start_date and end_date:
        query += " WHERE timestamp BETWEEN %s AND %s"
        params = [start_date, end_date]

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()

    if rows:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    else:
        output.write("No data available")

    response = Response(output.getvalue(), mimetype='text/csv')
    response.headers['Content-Disposition'] = f'attachment; filename={table_name}_export.csv'
    return response


# =====================================================================
# 🚀 RUN APP
# =====================================================================
if __name__ == '__main__':
    app.run(debug=True, port=5000)