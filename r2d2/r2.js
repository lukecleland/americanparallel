const noble = require("noble-mac");

const DROID_ADDRESS = "cd7fd4b912bc"; // Lowercase, no colons
const FORCE_CHAR_HANDLE = 0x15;
const COMMAND_CHAR_HANDLE = 0x1c;

// UUIDs for characteristics are usually in 128-bit form; you'll likely need to discover these
let droidPeripheral;

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
  console.log("Discovered peripheral:", name);
  if (name && name.toLowerCase().includes("d2")) {
    console.log("Found droid:", name, peripheral.address);
    noble.stopScanning();
    connectAndSend(peripheral);
  }

  //   if (peripheral.address === DROID_ADDRESS) {
  //     console.log("Found droid!");
  //     noble.stopScanning();
  //     droidPeripheral = peripheral;
  //     await connectAndSend(peripheral);
  //   }
});

async function connectAndSend(peripheral) {
  peripheral.connect(async (error) => {
    if (error) {
      console.error("Connection error:", error);
      return;
    }

    console.log("Connected. Discovering services...");
    peripheral.discoverAllServicesAndCharacteristics(
      (error, services, characteristics) => {
        if (error) {
          console.error("Discovery error:", error);
          return;
        }

        const forceChar = characteristics.find(
          (c) => c._noble._bindings._handles[c.uuid] === FORCE_CHAR_HANDLE
        );
        const commandChar = characteristics.find(
          (c) => c._noble._bindings._handles[c.uuid] === COMMAND_CHAR_HANDLE
        );

        if (!forceChar || !commandChar) {
          console.error("Required characteristics not found.");
          return;
        }

        // Send "usetheforce...band"
        const forcePayload = Buffer.from("usetheforce. ..band", "utf-8");
        forceChar.write(forcePayload, true, (err) => {
          if (err) console.error("Force write failed:", err);
          else console.log("Sent force command");
        });

        // Example wake command
        const wakePacket = Buffer.from([
          0x8d, 0x0a, 0x13, 0x0d, 0x00, 0xd5, 0xd8,
        ]);
        commandChar.write(wakePacket, true, (err) => {
          if (err) console.error("Wake write failed:", err);
          else console.log("Sent wake command");
        });
      }
    );
  });
}
