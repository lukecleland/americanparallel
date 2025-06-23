const noble = require("noble-mac");

const DROID_NAME_HINT = "d2-"; // case-insensitive match
const FORCE_PAYLOAD = Buffer.from([
  0x75, 0x73, 0x65, 0x74, 0x68, 0x65, 0x66, 0x6f, 0x72, 0x63, 0x65, 0x2e, 0x2e,
  0x2e, 0x62, 0x61, 0x6e, 0x64,
]);
const WAKE_PACKET = Buffer.from([0x8d, 0x0a, 0x13, 0x0d, 0x00, 0xd5, 0xd8]);
const ROTATE_PACKET = Buffer.from([
  0x8d, 0x0a, 0x17, 0x0f, 0x1c, 0x42, 0xb4, 0x00, 0x00, 0xbd, 0xd8,
]);
const SLEEP_PACKET = Buffer.from([0x8d, 0x0a, 0x13, 0x01, 0x17, 0xca, 0xd8]);

noble.on("stateChange", async (state) => {
  if (state === "poweredOn") {
    console.log("Scanning...");
    noble.startScanning([], false);
  } else {
    noble.stopScanning();
  }
});

noble.on("discover", async (peripheral) => {
  const name = peripheral.advertisement.localName;
  console.log("Discovered peripheral:", name || "(no name)");

  if (name && name.toLowerCase().includes(DROID_NAME_HINT)) {
    console.log("Found droid:", name);
    noble.stopScanning();
    await connectAndSend(peripheral);
  }
});

async function connectAndSend(peripheral) {
  peripheral.connect(async (error) => {
    if (error) {
      console.error("Connection error:", error);
      return;
    }

    console.log("Connected. Discovering services/characteristics...");
    peripheral.discoverAllServicesAndCharacteristics(
      async (error, services, characteristics) => {
        if (error) {
          console.error("Discovery error:", error);
          return;
        }

        // Log all UUIDs so we can identify which is which
        console.log("=== Characteristics discovered ===");
        characteristics.forEach((c, idx) => {
          console.log(`${idx}: UUID = ${c.uuid}`);
        });

        // Try guessing based on index, just to test
        const forceChar = characteristics[2];
        const commandChar = characteristics[0];

        for (var i = 0; i < characteristics.length; i++) {
          for (var j = 0; j < characteristics.length; j++) {
            try {
              await writePromise(characteristics[i], FORCE_PAYLOAD);
              console.log("✅ Sent force command");
              await writePromise(characteristics[j], WAKE_PACKET);
              //   console.log("✅ Sent wake command");
              //   await writePromise(commandChar, ROTATE_PACKET);
              //   console.log("✅ Sent rotate command");
              //   await writePromise(commandChar, SLEEP_PACKET);
              //   console.log("✅ Sent sleep command");
            } catch (err) {
              console.error("❌ Write failed:", err);
            }
          }
        }
      }
    );
  });
}

function writePromise(char, data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      char.write(data, true, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }, 2000); // Delay to ensure connection is stable before writing
  });
}
