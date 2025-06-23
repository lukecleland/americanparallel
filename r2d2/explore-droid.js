const noble = require("@abandonware/noble");

// Your target device name
const TARGET_NAME = "D2-12BC";

noble.on("stateChange", (state) => {
  if (state === "poweredOn") {
    console.log("Scanning for devices...");
    noble.startScanning([], false);
  } else {
    noble.stopScanning();
  }
});

noble.on("discover", async (peripheral) => {
  const name = peripheral.advertisement.localName;

  if (name === TARGET_NAME) {
    console.log(`✅ Found target: ${name} (${peripheral.id})`);
    noble.stopScanning();

    peripheral.connect((err) => {
      if (err) {
        console.error("❌ Connection error:", err);
        return;
      }
      console.log("🔌 Connected. Discovering services...");

      peripheral.discoverAllServicesAndCharacteristics(
        (err, services, characteristics) => {
          if (err) {
            console.error("❌ Discovery error:", err);
            return;
          }

          console.log(`🔍 Found ${services.length} services`);
          services.forEach((service) => {
            console.log(`\n🧪 Service UUID: ${service.uuid}`);
            service.characteristics.forEach((char) => {
              console.log(
                `   └─ Characteristic UUID: ${
                  char.uuid
                } | Properties: ${char.properties.join(", ")}`
              );
            });
          });

          // You can disconnect after exploring
          peripheral.disconnect(() => {
            console.log("🔌 Disconnected");
          });
        }
      );
    });
  }
});
