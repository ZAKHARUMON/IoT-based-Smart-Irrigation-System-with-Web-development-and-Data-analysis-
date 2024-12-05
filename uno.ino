#include <DHT.h>

// DHT sensor setup
#define DHTPIN 5        // Define the pin connected to the DHT sensor
#define DHTTYPE DHT11   // Define the type of DHT sensor (DHT11 or DHT22)
DHT dht(DHTPIN, DHTTYPE);

// Soil moisture sensor pin
int soilMoisturePin = A0;

// Rain sensor pin
int rainSensorPin = 7; // Digital pin connected to rain sensor

// Relay pin for motor control
int relayPin = 4;

void setup() {
  dht.begin();                // Initialize the DHT sensor
  Serial.begin(9600);         // Start serial communication with ESP8266
  pinMode(soilMoisturePin, INPUT);
  pinMode(rainSensorPin, INPUT);
  pinMode(relayPin, OUTPUT);
}

void loop() {
  // Read DHT sensor data
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // Read and map soil moisture data
  int soilMoistureRaw = analogRead(soilMoisturePin);
  int soilMoisture = constrain(map(soilMoistureRaw, 550, 10, 0, 100), 0, 100);

  // Read rain sensor data
  bool isRaining = digitalRead(rainSensorPin) == LOW; // Assuming LOW indicates rain

  // Control the relay (motor) based on soil moisture and rain status
  if (soilMoistureRaw < 400 && !isRaining) {
    digitalWrite(relayPin, HIGH);  // Motor ON
  } else {
    digitalWrite(relayPin, LOW);   // Motor OFF
  }

  // Prepare JSON data
  String jsonData = "{\"temperature\":";
  jsonData += temperature;
  jsonData += ",\"humidity\":";
  jsonData += humidity;
  jsonData += ",\"soilMoisture\":";
  jsonData += soilMoisture;
  jsonData += ",\"isRaining\":";
  jsonData += (isRaining ? "true" : "false");
  jsonData += "}";

  Serial.println(jsonData); // Send JSON data to ESP8266

  delay(5000);  // Send data every 5 seconds
}
