from flask import Blueprint, request, jsonify
from db import get_db_connection
import datetime

iot_bp = Blueprint('iot', __name__)

@iot_bp.route('/api/iot/data', methods=['POST'])
def receive_iot_data():
    """
    Endpoint to receive telemetry data from ESP32 or light sensor.
    Expected JSON body:
    {
        "pole_id": "A01",
        "status": "ON",
        "signal_strength": -72,
        "firmware_version": "v1.0.3"
    }
    """

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data received"}), 400

    # ✅ Validate mandatory fields
    required = ["pole_id", "status"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    pole_id = data["pole_id"]
    status = data["status"].upper()
    signal_strength = data.get("signal_strength", None)
    firmware_version = data.get("firmware_version", None)

    # ✅ Validate values
    if status not in ["ON", "OFF"]:
        return jsonify({"error": "Invalid status value"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # ✅ Check if pole exists
    cursor.execute("SELECT * FROM poles WHERE pole_id = %s", (pole_id,))
    pole = cursor.fetchone()

    if not pole:
        conn.close()
        return jsonify({"error": f"Pole {pole_id} not found"}), 404

    # ✅ Insert telemetry record
    cursor.execute("""
        INSERT INTO telemetry_data (pole_id, status, signal_strength, timestamp)
        VALUES (%s, %s, %s, %s)
    """, (
        pole_id,
        status,
        signal_strength,
        datetime.datetime.utcnow()
    ))

    # ✅ Update pole info
    cursor.execute("""
        UPDATE poles
        SET status = %s,
            communication_status = 'ONLINE',
            firmware_version = %s,
            update_time = %s
        WHERE pole_id = %s
    """, (
        status,
        firmware_version,
        datetime.datetime.utcnow(),
        pole_id
    ))

    # ✅ Optional: trigger alert if OFFLINE or weak signal
    alert_needed = False
    alert_msg = ""
    alert_type = ""
    severity = ""

    if signal_strength and signal_strength < -85:
        alert_needed = True
        alert_msg = f"Weak signal strength ({signal_strength} dBm)"
        alert_type = "No Communication"
        severity = "warning"

    if status == "OFF" and pole["status"] == "ON":
        alert_needed = True
        alert_msg = "Sudden light OFF detected"
        alert_type = "Manual Switch"
        severity = "critical"

    if alert_needed:
        cursor.execute("""
            INSERT INTO alerts (pole_id, message, severity, alert_type, alert_status, timestamp)
            VALUES (%s, %s, %s, %s, 'ACTIVE', %s)
        """, (
            pole_id,
            alert_msg,
            severity,
            alert_type,
            datetime.datetime.utcnow()
        ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Telemetry data received successfully"}), 200