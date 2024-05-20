import machine
import dht
import time
import urequests

# Define DHT11 sensor pin
dht_pin = 2  # D4

# Define Wi-Fi credentials
wifi_ssid = "Ta**o" #Add your wifi name
wifi_password = "za***05" #Add your wifi password

# Define the HTTP endpoint to send data, this can be your localhost as well
http_endpoint = "https://cool-webs-share.loca.lt/sensor-data"

# Set GPIO pin for DHT11
dht_sensor = dht.DHT11(machine.Pin(dht_pin))

# Connect to Wi-Fi
def connect_to_wifi():
    import network
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print("Connecting to WiFi...")
        wlan.connect(wifi_ssid, wifi_password)
        while not wlan.isconnected():
            pass
    print("Connected to WiFi:", wlan.ifconfig())

# Main loop
try:
    connect_to_wifi()

    while True:
        # Perform a measurement
        dht_sensor.measure()

        # Read temperature and humidity
        temperature_celsius = dht_sensor.temperature()
        humidity_percentage = dht_sensor.humidity()

        # Print the results
        print("Temperature: {:.2f} °C, Humidity: {:.2f} %".format(temperature_celsius, humidity_percentage))

        # Send data to the server using HTTP POST
        data = {"temperature": temperature_celsius, "humidity": humidity_percentage}
        response = urequests.post(http_endpoint, json=data)

        # Check the response
        if response.status_code == 200:
            print("Data sent successfully")
        else:
            print("Failed to send data. Status code:", response.status_code)

        # Close the response
        response.close()
        # Wait for 10 seconds before the next measurement
        time.sleep(30)

except KeyboardInterrupt:
    print("Measurement stopped by user")
