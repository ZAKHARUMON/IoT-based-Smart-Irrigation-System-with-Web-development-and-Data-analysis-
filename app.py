from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['DEBUG'] = True  # Enable debugging
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///plant_data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define the PlantData model
class PlantData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    soil_moisture = db.Column(db.Integer, nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    is_raining = db.Column(db.Boolean, nullable=False)  # New field for rain sensor data

    def __repr__(self):
        return f"<PlantData {self.id} - Moisture: {self.soil_moisture}, Temp: {self.temperature}, Humidity: {self.humidity}, Raining: {self.is_raining}>"

# Create the tables in the database
with app.app_context():
    db.create_all()

# Route to receive data (POST)
@app.route('/submitData', methods=['POST'])
def receive_data():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid JSON format"}), 400

        # Extract data from JSON
        soil_moisture = data.get('soilMoisture')
        temperature = data.get('temperature')
        humidity = data.get('humidity')
        is_raining = data.get('isRaining')

        # Check that all fields are present
        if None in (soil_moisture, temperature, humidity, is_raining):
            return jsonify({"message": "Missing required data fields"}), 400

        # Store the data in the database
        new_data = PlantData(
            soil_moisture=soil_moisture,
            temperature=temperature,
            humidity=humidity,
            is_raining=is_raining
        )
        db.session.add(new_data)
        db.session.commit()

        return jsonify({"message": "Data received successfully"}), 201

    except Exception as e:
        print(f"Error: {str(e)}")  # Debugging output
        return jsonify({"message": f"Internal server error: {str(e)}"}), 500

# Route to fetch the latest data (GET)
@app.route('/api/plantData', methods=['GET'])
def get_latest_data():
    latest_data = PlantData.query.order_by(PlantData.id.desc()).first()
    if latest_data:
        return jsonify({
            "soilMoisture": latest_data.soil_moisture,
            "temperature": latest_data.temperature,
            "humidity": latest_data.humidity,
            "isRaining": latest_data.is_raining
        }), 200
    else:
        return jsonify({"message": "No data available"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
