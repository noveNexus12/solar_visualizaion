from flask import Flask, jsonify
from flask_cors import CORS
from auth import auth_bp
from db import get_db_connection  # single source for DB connection

app = Flask(__name__)

# ✅ CORS: allow your frontend
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:8080", "http://127.0.0.1:8080"]}}, supports_credentials=True)


# Register auth blueprint
app.register_blueprint(auth_bp, url_prefix='/api/auth')


# ------------------------------- Routes (unchanged) -------------------------------

@app.route('/api/poles', methods=['GET'])
def get_poles():
    import datetime

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            pole_id,
            cluster_id,
            latitude,
            longitude,
            status,
            battery_percentage,
            communication_status,
            state,
            district,
            city_or_village,
            led_status,
            mode,
            firmware_version,
            update_time
        FROM poles
    """)

    data = cursor.fetchall()
    conn.close()

    now = datetime.datetime.utcnow()

    for row in data:
        # Convert MySQL datetime to ISO string for frontend
        if row['update_time']:
            row['update_time'] = row['update_time'].isoformat()

        display_status = row['communication_status']

        # Add orange ("MAINTENANCE") logic
        if row['communication_status'] == 'OFFLINE' and row['update_time']:
            update_time = datetime.datetime.fromisoformat(row['update_time'])
            diff_days = (now - update_time).days

            if diff_days < 3:
                display_status = 'MAINTENANCE'  # 🟠
            else:
                display_status = 'OFFLINE'      # 🔴
        elif row['communication_status'] == 'ONLINE':
            display_status = 'ONLINE'          # 🟢

        row['display_status'] = display_status

    return jsonify(data)



@app.route('/api/poles/<pole_id>', methods=['GET'])
def get_pole_details(pole_id):
    import datetime

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            pole_id,
            cluster_id,
            latitude,
            longitude,
            status AS device_status,
            communication_status,
            state,
            district,
            city_or_village,
            led_status,
            mode,
            firmware_version,
            update_time
        FROM poles
        WHERE pole_id = %s
    """, (pole_id,))

    data = cursor.fetchone()
    conn.close()

    if not data:
        return jsonify({"error": "Pole not found"}), 404

    if data['update_time']:
        data['update_time'] = data['update_time'].isoformat()

    # Same maintenance logic for individual view
    now = datetime.datetime.utcnow()
    display_status = data['communication_status']

    if data['communication_status'] == 'OFFLINE' and data['update_time']:
        update_time = datetime.datetime.fromisoformat(data['update_time'])
        diff_days = (now - update_time).days

        if diff_days < 3:
            display_status = 'MAINTENANCE'
        else:
            display_status = 'OFFLINE'
    elif data['communication_status'] == 'ONLINE':
        display_status = 'ONLINE'

    data['display_status'] = display_status

    return jsonify(data)



@app.route('/api/telemetry', methods=['GET'])
def get_telemetry():
    from flask import request, jsonify
    pole_id = request.args.get('pole_id')
    mode = request.args.get('mode', 'filtered')  # optional flag

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if pole_id:
        if mode == 'filtered':
            # Fetch only sunrise (06:30–07:00) and sunset (18:00–18:30) data
            cursor.execute("""
                SELECT
                    pole_id,
                    timestamp,
                    solar_voltage,
                    battery_voltage,
                    battery_current,
                    battery_percentage,
                    load_current,
                    energy_generated,
                    energy_consumed,
                    light_intensity,
                    signal_strength,
                    data_source,
                    data_quality
                FROM telemetry_data
                WHERE pole_id = %s
                  AND (
                    (TIME(timestamp) BETWEEN '06:30:00' AND '07:00:00')
                    OR (TIME(timestamp) BETWEEN '18:00:00' AND '18:30:00')
                  )
                ORDER BY timestamp DESC
            """, (pole_id,))
        else:
            # Unfiltered (for debugging or manual override)
            cursor.execute("""
                SELECT
                    pole_id,
                    timestamp,
                    solar_voltage,
                    battery_voltage,
                    battery_current,
                    battery_percentage,
                    load_current,
                    energy_generated,
                    energy_consumed,
                    light_intensity,
                    signal_strength,
                    data_source,
                    data_quality
                FROM telemetry_data
                WHERE pole_id = %s
                ORDER BY timestamp DESC
                LIMIT 24
            """, (pole_id,))
    else:
        cursor.execute("""
            SELECT
                pole_id,
                timestamp,
                solar_voltage,
                battery_voltage,
                battery_current,
                battery_percentage,
                load_current,
                energy_generated,
                energy_consumed,
                light_intensity,
                signal_strength,
                data_source,
                data_quality
            FROM telemetry_data
            WHERE 
                (TIME(timestamp) BETWEEN '06:30:00' AND '07:00:00')
                OR (TIME(timestamp) BETWEEN '18:00:00' AND '18:30:00')
            ORDER BY timestamp DESC
        """)

    data = cursor.fetchall()
    conn.close()

    # Convert datetime to ISO format for frontend
    for row in data:
        if row['timestamp']:
            row['timestamp'] = row['timestamp'].isoformat()

    return jsonify(data)



@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT
            pole_id,
            message,
            severity,
            alert_status,
            alert_type,
            technician_id,
            action_taken,
            remarks,
            timestamp
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
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(*) AS total FROM poles")
    total = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) AS active FROM poles WHERE status='ON' OR led_status='ON'")
    active = cursor.fetchone()['active']

    cursor.execute("SELECT COUNT(*) AS inactive FROM poles WHERE status='OFF' OR led_status='OFF'")
    inactive = cursor.fetchone()['inactive']

    cursor.execute("SELECT COUNT(*) AS alerts FROM alerts WHERE alert_status='ACTIVE'")
    alerts = cursor.fetchone()['alerts']

    conn.close()

    return jsonify({
        "total": total,
        "active": active,
        "inactive": inactive,
        "alerts": alerts
    })

@app.route('/api/export/<table_name>', methods=['GET'])
def export_csv(table_name):
    import io, csv
    from flask import Response, request

    valid_tables = {
        'telemetry': 'telemetry_data',
        'alerts': 'alerts',
        'poles': 'poles'
    }

    if table_name not in valid_tables:
        return jsonify({'error': 'Invalid dataset'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Optional date filters
    start_date = request.args.get('start')
    end_date = request.args.get('end')

    query = f"SELECT * FROM {valid_tables[table_name]}"
    params = []

    if start_date and end_date:
        query += " WHERE timestamp BETWEEN %s AND %s"
        params.extend([start_date, end_date])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=rows[0].keys() if rows else [])
    writer.writeheader()
    writer.writerows(rows)

    response = Response(output.getvalue(), mimetype='text/csv')
    response.headers['Content-Disposition'] = f'attachment; filename={table_name}_export.csv'
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5000)
