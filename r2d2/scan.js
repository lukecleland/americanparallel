const noble = require("@abandonware/noble");

noble.on("stateChange", async (state) => {
  console.log("Bluetooth state:", state);
  if (state === "poweredOn") {
    console.log("Starting scan...");
    await noble.startScanningAsync([], false);
  }
});

noble.on("discover", (peripheral) => {
  console.log(
    `Found: ${peripheral.address} - ${peripheral.advertisement.localName}`
  );
});
