const noble = require("@abandonware/noble");

const TARGET_NAME = "D2-12BC";
const TARGET_SERVICE_UUID = "00010001574f4f2053706865726f2121";
const CONTROL_CHAR_UUID = "00010002574f4f2053706865726f2121"; // or try 00010003... later

// Example command: this will need to be replaced with real opcodes
const commandBytes = Buffer.from([0x8d, 0x0a, 0x13, 0x0d, 0x00, 0xd5, 0xd8]); // Example/test — won't harm R2

noble.on("stateChange", (state) => {
  if (state === "poweredOn") {
    noble.startScanning([], false);
  } else {
    noble.stopScanning();
  }
});

noble.on("discover", (peripheral) => {
  const name = peripheral.advertisement.localName;

  if (name === TARGET_NAME) {
    noble.stopScanning();

    peripheral.connect((err) => {
      if (err) return console.error("Connection error:", err);

      peripheral.discoverSomeServicesAndCharacteristics(
        [TARGET_SERVICE_UUID],
        [CONTROL_CHAR_UUID],
        (err, services, characteristics) => {
          if (err) return console.error("Discovery error:", err);

          const controlChar = characteristics[0];
          console.log("✨ Sending command...");
          controlChar.write(commandBytes, false, (err) => {
            if (err) return console.error("Write error:", err);
            console.log("✅ Command sent!");
            peripheral.disconnect();
          });
        }
      );
    });
  }
});
