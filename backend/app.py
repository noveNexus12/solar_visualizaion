from flask import Flask, jsonify,request
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='incorrect@11',
        database='solar_dashboard'
    )

@app.route('/api/poles', methods=['GET'])
def get_poles():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT 
            pole_id,
            cluster_id,
            latitude,
            longitude,
            status,
            battery_percentage,   -- ✅ Make sure this is included exactly as this
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
    
    for row in data:
        if row['update_time']:
            row['update_time'] = row['update_time'].isoformat()
    
    return jsonify(data)



@app.route('/api/poles/<pole_id>', methods=['GET'])
def get_pole_details(pole_id):
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
    
    if data and data['update_time']:
        data['update_time'] = data['update_time'].isoformat()
    
    if data is None:
        return jsonify({"error": "Pole not found"}), 404
    
    return jsonify(data)


@app.route('/api/telemetry', methods=['GET'])
def get_telemetry():
    pole_id = request.args.get('pole_id')  # get pole_id from query param
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
        SELECT
            pole_id,
            timestamp,
            solar_voltage,
            battery_voltage,
            battery_percentage,
            load_current,
            energy_generated,
            energy_consumed,
            light_intensity,
            signal_strength
        FROM telemetry_data
    """
    params = ()
    if pole_id:
        query += " WHERE pole_id = %s"
        params = (pole_id,)
    
    query += " ORDER BY timestamp DESC LIMIT 24"
    cursor.execute(query, params)
    data = cursor.fetchall()
    conn.close()
    
    for row in data:
        if row['timestamp']:
            row['timestamp'] = row['timestamp'].isoformat()
    
    return jsonify(data)




@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Explicitly select all required alert fields
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
    
    # Format datetime to ISO string for frontend
    for row in data:
        if row['timestamp']:
            row['timestamp'] = row['timestamp'].isoformat()
    
    return jsonify(data)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Total poles
    cursor.execute("SELECT COUNT(*) AS total FROM poles")
    total = cursor.fetchone()['total']

    # Active / inactive (use either 'status' or 'led_status')
    cursor.execute("""
        SELECT COUNT(*) AS active 
        FROM poles 
        WHERE status='ON' OR led_status='ON'
    """)
    active = cursor.fetchone()['active']

    cursor.execute("""
        SELECT COUNT(*) AS inactive 
        FROM poles 
        WHERE status='OFF' OR led_status='OFF'
    """)
    inactive = cursor.fetchone()['inactive']

    # Active alerts only
    cursor.execute("SELECT COUNT(*) AS alerts FROM alerts WHERE alert_status='ACTIVE'")
    alerts = cursor.fetchone()['alerts']

    conn.close()

    # ✅ Match the frontend field names
    return jsonify({
        "total": total,
        "active": active,
        "inactive": inactive,
        "alerts": alerts
    })


if __name__ == '__main__':
    app.run(debug=True)
