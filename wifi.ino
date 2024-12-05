#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

// Wi-Fi credentials
const char* ssid = "Airel_9811053331";
const char* password = "dl10ct1987@";

// Server URL
const char* serverName = "http://192.168.1.15:8080/submitData";

String buffer = ""; // Temporary buffer to store incoming data

void setup() {
  Serial.begin(9600);  // Communication with Arduino
  WiFi.begin(ssid, password);

  // Connect to Wi-Fi
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {  // Check Wi-Fi connection
    while (Serial.available() > 0) {
      char c = Serial.read();
      buffer += c;

      // Check for complete JSON object (ends with `}`)
      if (c == '}') {
        Serial.print("Received data: ");
        Serial.println(buffer);

        // Send HTTP POST request
        HTTPClient http;
        WiFiClient client;
        http.begin(client, serverName);
        http.addHeader("Content-Type", "application/json");

        int httpResponseCode = http.POST(buffer);

        if (httpResponseCode > 0) {
          Serial.print("HTTP Response code: ");
          Serial.println(httpResponseCode);
        } else {
          Serial.print("Error in HTTP request: ");
          Serial.println(httpResponseCode);
        }

        http.end();
        buffer = ""; // Clear the buffer for the next message
      }
    }
  } else {
    Serial.println("WiFi Disconnected");
  }

  delay(1000);  // Delay to prevent overwhelming the ESP8266
}
