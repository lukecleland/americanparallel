#!/usr/bin/env python3

import asyncio
import sys
import getopt
import time
from bleak import BleakClient, BleakScanner

# Default values
command = None
sendbytes = None
sleeponexit = True
sequences = []

# Map of named commands to their byte sequences
commandmap = {
    "laugh": [0x0A, 0x18, 0x00, 0x1F, 0x00, 0x32, 0x00, 0x00, 0x00, 0x00, 0x00],
    "yes": [0x0A, 0x17, 0x05, 0x41, 0x00, 0x0F],
    "no": [0x0A, 0x17, 0x05, 0x3F, 0x00, 0x10],
    "alarm": [0x0A, 0x17, 0x05, 0x17, 0x00, 0x07],
    "angry": [0x0A, 0x17, 0x05, 0x18, 0x00, 0x08],
    "annoyed": [0x0A, 0x17, 0x05, 0x19, 0x00, 0x09],
    "ionblast": [0x0A, 0x17, 0x05, 0x1A, 0x00, 0x0E],
    "sad": [0x0A, 0x17, 0x05, 0x1C, 0x00, 0x11],
    "scared": [0x0A, 0x17, 0x05, 0x1D, 0x00, 0x13],
    "chatty": [0x0A, 0x17, 0x05, 0x17, 0x00, 0x0A],
    "confident": [0x0A, 0x17, 0x05, 0x18, 0x00, 0x12],
    "excited": [0x0A, 0x17, 0x05, 0x19, 0x00, 0x0C],
    "happy": [0x0A, 0x17, 0x05, 0x1A, 0x00, 0x0D],
    "surprise": [0x0A, 0x17, 0x05, 0x1C, 0x00, 0x18],
    "tripod": [0x0A, 0x17, 0x0D, 0x1D, 0x01],
    "bipod": [0x0A, 0x17, 0x0D, 0x1C, 0x02]
}

def GenCrc(bytes_):
    ret = sum(bytes_) % 256
    return (~ret) & 0xFF

def BuildPacket(bytes_):
    return [0x8D] + bytes_ + [GenCrc(bytes_), 0xD8]

# Parse CLI options
try:
    opts, args = getopt.getopt(sys.argv[1:], "c:n", ["command=", "nosleep"])
except getopt.GetoptError as err:
    print(err)
    sys.exit(1)

for o, a in opts:
    if o in ("-c", "--command"):
        command = a
        if command == "list":
            for cmdopt in commandmap:
                print(cmdopt)
            sys.exit(0)
        sequences.append(commandmap[command])
    elif o in ("-n", "--nosleep"):
        sleeponexit = False

if command is None:
    print("A command must be specified. Use -c list to get a list of commands.")
    sys.exit(1)

# Main async logic
async def main():
    print("Scanning for R2-D2...")
    devices = await BleakScanner.discover()
    droid = next((d for d in devices if d.name and "r2" in d.name.lower()), None)
    if not droid:
        print("R2-D2 not found. Make sure it's on and nearby.")
        return

    print(f"Found R2-D2: {droid.name} ({droid.address})")

    async with BleakClient(droid) as client:
        # Send init handshake
        await client.write_gatt_char(0x0015, bytearray(b"usetheforce...band"), response=True)

        # Wake up
        await client.write_gatt_char(0x001c, bytearray([0x8D, 0x0A, 0x13, 0x0D, 0x00, 0xD5, 0xD8]), response=True)

        # Turn on holoprojector
        await client.write_gatt_char(0x001c, bytearray([0x8D,0x0A,0x1A,0x0E,0x1C,0x00,0x80,0xFF,0x32,0xD8]), response=True)

        for seq in sequences:
            await client.write_gatt_char(0x001c, bytearray(BuildPacket(seq)), response=True)
            await asyncio.sleep(2)

        # Rotate to -90 degrees
        await client.write_gatt_char(0x001c, bytearray([0x8D,0x0A,0x17,0x0F,0x1C,0x42,0xB4,0x00,0x00,0xBD,0xD8]), response=True)

        # Rotate to 0 degrees
        await client.write_gatt_char(0x001c, bytearray([0x8D,0x0A,0x17,0x0F,0x1E,0x00,0x00,0x00,0x00,0xB1,0xD8]), response=True)

        if sleeponexit:
            # Sleep
            await client.write_gatt_char(0x001c, bytearray([0x8D,0x0A,0x13,0x01,0x17,0xCA,0xD8]), response=True)

asyncio.run(main())
