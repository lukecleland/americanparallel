const noble = require("@abandonware/noble");
const process = require("process");

const ADDRESS = "cd7fd4b912bc".toLowerCase(); // lowercase & no colons
const COMMANDS = {
  yes: [0x0a, 0x17, 0x05, 0x41, 0x00, 0x0f],
  no: [0x0a, 0x17, 0x05, 0x3f, 0x00, 0x10],
  alarm: [0x0a, 0x17, 0x05, 0x17, 0x00, 0x07],
  angry: [0x0a, 0x17, 0x05, 0x18, 0x00, 0x08],
  // add more...
};

function genCrc(bytes) {
  let sum = bytes.reduce((a, b) => (a + b) % 256, 0);
  return ~sum & 0xff;
}

function buildPacket(payload) {
  return Buffer.from([0x8d, ...payload, genCrc(payload), 0xd8]);
}

const handleUuid = "1c"; // usually you'd use a UUID instead

const commandArg = process.argv[2];
if (!COMMANDS[commandArg]) {
  console.log("Usage: node droid-controller.js <command>");
  console.log("Commands:", Object.keys(COMMANDS).join(", "));
  process.exit(1);
}

noble.on("stateChange", async (state) => {
  if (state === "poweredOn") {
    noble.startScanning([], false);
  }
});

noble.on("discover", async (peripheral) => {
  if (peripheral.address === ADDRESS) {
    noble.stopScanning();

    console.log(`Connecting to ${peripheral.address}...`);
    await peripheral.connectAsync();
    const { characteristics } =
      await peripheral.discoverSomeServicesAndCharacteristicsAsync([], []);

    const char = characteristics.find(
      (c) => c.properties.includes("write") && c.uuid.endsWith(handleUuid)
    );
    if (!char) {
      console.error("Write characteristic not found.");
      process.exit(1);
    }

    // Handshake
    await char.writeAsync(
      Buffer.from([
        0x75, 0x73, 0x65, 0x74, 0x68, 0x65, 0x66, 0x6f, 0x72, 0x63, 0x65, 0x2e,
        0x2e, 0x2e, 0x62, 0x61, 0x6e, 0x64,
      ]),
      true
    );

    // Wake
    await char.writeAsync(
      Buffer.from([0x8d, 0x0a, 0x13, 0x0d, 0x00, 0xd5, 0xd8]),
      true
    );

    // LED on
    await char.writeAsync(
      Buffer.from([0x8d, 0x0a, 0x1a, 0x0e, 0x1c, 0x00, 0x80, 0xff, 0x32, 0xd8]),
      true
    );

    // Command packet
    const packet = buildPacket(COMMANDS[commandArg]);
    console.log("Sending packet:", packet);
    await char.writeAsync(packet, true);

    // Top rotate to -90
    await char.writeAsync(
      Buffer.from([
        0x8d, 0x0a, 0x17, 0x0f, 0x1c, 0x42, 0xb4, 0x00, 0x00, 0xbd, 0xd8,
      ]),
      true
    );

    // Top rotate to 0
    await char.writeAsync(
      Buffer.from([
        0x8d, 0x0a, 0x17, 0x0f, 0x1e, 0x00, 0x00, 0x00, 0x00, 0xb1, 0xd8,
      ]),
      true
    );

    // Sleep
    await char.writeAsync(
      Buffer.from([0x8d, 0x0a, 0x13, 0x01, 0x17, 0xca, 0xd8]),
      true
    );

    await peripheral.disconnectAsync();
    console.log("Done.");
    process.exit(0);
  }
});
