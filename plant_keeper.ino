#include <WiFi.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <FirebaseESP32.h>

// Initialize the LCD with the I2C address and dimensions
LiquidCrystal_I2C lcd(0x27, 20, 4);
DHT dht(26, DHT22); // Initialize DHT sensor
const int sensorPin1 = 32;
const int sensorPin2 = 35;
const int sensorPin3 = 34;
const int sensorPin4 = 33;
// WiFi credentials
const char* ssid = "904-";
const char* password = "#1";

FirebaseConfig config;
FirebaseAuth auth;

#define FIREBASE_HOST "https://smart-irrigation--cp"
#define FIREBASE_API_KEY "-zGtkpekTMHhkfYs"

FirebaseData firebaseData;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  lcd.init();
  lcd.backlight();
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi connected");
  lcd.print("Wi-Fi connected");
  dht.begin();  // Start DHT sensor

  // Configure Firebase
  config.host = FIREBASE_HOST;
  config.api_key = FIREBASE_API_KEY;
  auth.user.email = "mdr8077@gmail.com"; // If using email/password auth
  auth.user.password = "1213189We#";

  // Initialize Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Test if Firebase is ready
  if (Firebase.ready()) {
    Serial.println("Firebase connected");
  } else {
    Serial.println("Failed to connect to Firebase");
  }
}

void loop() {
  lcd.clear();
  float temp = dht.readTemperature();  // Read temperature
  float humi = dht.readHumidity();     // Read humidity

  if (Firebase.setFloat(firebaseData, "/Temp", temp)) {
  Serial.println("Temperature sent to Firebase");
  } else {
    Serial.print("Failed to send temperature: ");
    Serial.println(firebaseData.errorReason());
  }

  if (Firebase.setFloat(firebaseData, "/Humidity", hum)) {
    Serial.println("Humidity sent to Firebase");
  } else {
    Serial.print("Failed to send humidity: ");
    Serial.println(firebaseData.errorReason());
  }

  float sensorValue1 = 100.00 - ((analogRead(sensorPin1) - 1040.00) * 100.00 / (2860.00 - 1040.00));
  float sensorValue2 = 100.00 - ((analogRead(sensorPin2) - 1010.00) * 100.00 / (2800.00 - 1010.00));
  float sensorValue3 = 100.00 - ((analogRead(sensorPin3) - 1110.00) * 100.00 / (2840.00 - 1110.00));
  float sensorValue4 = 100.00 - ((analogRead(sensorPin4) - 980.00) * 100.00 / (2640.00 - 980.00));

  sensorValue1 = constrain(sensorValue1, 0, 100);
  sensorValue2 = constrain(sensorValue2, 0, 100); 
  sensorValue3 = constrain(sensorValue3, 0, 100); 
  sensorValue4 = constrain(sensorValue4, 0, 100);

  Serial.print("Temperature: ");
  Serial.println(temp);
  Serial.print("Humidity: ");
  Serial.println(humi);
  Serial.print("Muisture 1: ");
  Serial.println(sensorValue1);
  Serial.print("Muisture 2: ");
  Serial.println(sensorValue2);
  Serial.print("Muisture 3: ");
  Serial.println(sensorValue3);
  Serial.print("Muisture 4: ");
  Serial.println(sensorValue4);

  lcd.setCursor(0, 0);
  lcd.print("T ");
  lcd.print(temp);
  lcd.print(" C ");

  lcd.print("H ");
  lcd.print(humi);
  lcd.print(" %");
  lcd.setCursor(0, 1);
  lcd.print(">");
  lcd.setCursor(1, 1);
  lcd.print(int(sensorValue1));
  lcd.print("%");
  lcd.setCursor(6, 1);
  lcd.print(int(sensorValue2));
  lcd.print("%");
  lcd.setCursor(11, 1);
  lcd.print(int(sensorValue3));
  lcd.print("%");
  lcd.setCursor(16, 1);
  lcd.print(int(sensorValue4));
  lcd.print("%");

  delay(2000); // Delay for 2 seconds
}
