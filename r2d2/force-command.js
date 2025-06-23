const noble = require("@abandonware/noble");

const TARGET_NAME = "D2-12BC";

const FORCE_UUID = "00010002574f4f2053706865726f2121"; // char at handle 0x15 in python
const CMD_UUID = "00020002574f4f2053706865726f2121"; // char at handle 0x1c in python

// Command map as in python
const commandMap = {
  laugh: [0x0a, 0x18, 0x00, 0x1f, 0x00, 0x32, 0x00, 0x00, 0x00, 0x00, 0x00],
  yes: [0x0a, 0x17, 0x05, 0x41, 0x00, 0x0f],
  no: [0x0a, 0x17, 0x05, 0x3f, 0x00, 0x10],
  alarm: [0x0a, 0x17, 0x05, 0x17, 0x00, 0x07],
  angry: [0x0a, 0x17, 0x05, 0x18, 0x00, 0x08],
  annoyed: [0x0a, 0x17, 0x05, 0x19, 0x00, 0x09],
  ionblast: [0x0a, 0x17, 0x05, 0x1a, 0x00, 0x0e],
  sad: [0x0a, 0x17, 0x05, 0x1c, 0x00, 0x11],
  scared: [0x0a, 0x17, 0x05, 0x1d, 0x00, 0x13],
  chatty: [0x0a, 0x17, 0x05, 0x17, 0x00, 0x0a],
  confident: [0x0a, 0x17, 0x05, 0x18, 0x00, 0x12],
  excited: [0x0a, 0x17, 0x05, 0x19, 0x00, 0x0c],
  happy: [0x0a, 0x17, 0x05, 0x1a, 0x00, 0x0d],
  surprise: [0x0a, 0x17, 0x05, 0x1c, 0x00, 0x18],
  tripod: [0x0a, 0x17, 0x0d, 0x1d, 0x01],
  bipod: [0x0a, 0x17, 0x0d, 0x1c, 0x02],
};

// CRC calc as per python
function genCrc(bytes) {
  let ret = 0;
  for (const b of bytes) {
    ret += b;
    ret = ret % 256;
  }
  return ~ret & 0xff;
}

// Build packet with start (0x8D), CRC, end (0xD8)
function buildPacket(bytes) {
  const ret = [0x8d, ...bytes];
  ret.push(genCrc(bytes));
  ret.push(0xd8);
  return Buffer.from(ret);
}

async function sendCommand(characteristics, commandName) {
  if (!(commandName in commandMap)) {
    throw new Error(`Unknown command: ${commandName}`);
  }
  const cmdPayload = commandMap[commandName];
  const packet = buildPacket(cmdPayload);
  const cmdChar = characteristics.find((c) => c.uuid === CMD_UUID);
  if (!cmdChar) throw new Error("Command characteristic not found");

  await cmdChar.writeAsync(packet, true);
  console.log(`✅ Sent command '${commandName}'`);
}

noble.on("stateChange", async (state) => {
  if (state === "poweredOn") {
    console.log("Starting scan...");
    noble.startScanning([], false);
  } else {
    noble.stopScanning();
  }
});

noble.on("discover", async (peripheral) => {
  if (peripheral.advertisement.localName === TARGET_NAME) {
    noble.stopScanning();
    console.log(`✅ Found target device: ${TARGET_NAME}`);

    try {
      await peripheral.connectAsync();
      console.log("🔌 Connected");

      const { characteristics } =
        await peripheral.discoverAllServicesAndCharacteristicsAsync();

      // Write "usetheforce...band" to FORCE_UUID characteristic
      const forceChar = characteristics.find((c) => c.uuid === FORCE_UUID);
      if (!forceChar) throw new Error("Force characteristic not found");
      const forceCommand = Buffer.from("usetheforce...band", "ascii");
      await forceChar.writeAsync(forceCommand, true);
      console.log("✅ Sent force command");

      // Wake up the droid
      const cmdChar = characteristics.find((c) => c.uuid === CMD_UUID);
      if (!cmdChar) throw new Error("Command characteristic not found");

      // Wake command
      const wakeCmd = Buffer.from([0x8d, 0x0a, 0x13, 0x0d, 0x00, 0xd5, 0xd8]);
      await cmdChar.writeAsync(wakeCmd, true);
      console.log("✅ Sent wake command");

      // LED command (max intensity)
      const ledCmd = Buffer.from([
        0x8d, 0x0a, 0x1a, 0x0e, 0x1c, 0x00, 0x80, 0xff, 0x32, 0xd8,
      ]);
      await cmdChar.writeAsync(ledCmd, true);
      console.log("✅ Sent LED command");

      // Send your command here, e.g. "laugh"
      await sendCommand(characteristics, "laugh");

      // Rotate top to -90 degrees
      const rotateNeg90 = Buffer.from([
        0x8d, 0x0a, 0x17, 0x0f, 0x1c, 0x42, 0xb4, 0x00, 0x00, 0xbd, 0xd8,
      ]);
      await cmdChar.writeAsync(rotateNeg90, true);
      console.log("✅ Rotated top to -90 degrees");

      // Rotate top to 0 degrees
      const rotate0 = Buffer.from([
        0x8d, 0x0a, 0x17, 0x0f, 0x1e, 0x00, 0x00, 0x00, 0x00, 0xb1, 0xd8,
      ]);
      await cmdChar.writeAsync(rotate0, true);
      console.log("✅ Rotated top to 0 degrees");

      // Optionally put droid to sleep
      const sleepCmd = Buffer.from([0x8d, 0x0a, 0x13, 0x01, 0x17, 0xca, 0xd8]);
      await cmdChar.writeAsync(sleepCmd, true);
      console.log("✅ Put droid to sleep");

      await peripheral.disconnectAsync();
      console.log("🔌 Disconnected");
      process.exit(0);
    } catch (err) {
      console.error("❌ Error:", err.message);
      process.exit(1);
    }
  }
});
