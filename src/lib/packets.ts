import osuTypes from "./enums/osuTypes";
import ServerPackets from "./enums/ServerPackets";
import writeType from "./writeType";

function write(packId: number, args?: [osuTypes, any][]) {
    let packIdBuffer = Buffer.from([packId & 0xff, (packId >> 8) & 0xff, 0x00]);

    let dataBuffer: Buffer = Buffer.from([]);
    for (const [type, data] of args ?? []) {
        if (type === osuTypes.raw) {
            dataBuffer = data;
        } else {
            dataBuffer = writeType[type](data);
        }
    }
    let sizeBuffer = Buffer.alloc(4);
    let length =
        Uint8Array.from(packIdBuffer).length +
        Uint8Array.from(dataBuffer).length;
    sizeBuffer.writeInt32LE(length);
    return Buffer.concat([packIdBuffer, sizeBuffer, dataBuffer]);
}

function writeULEB128(num: number): Buffer | ArrayBuffer {
    let buffer = [];
    do {
        let byte = num & 0x7f;
        num >>= 7;
        if (num !== 0) {
            byte |= 0x80;
        }
        buffer.push(byte);
    } while (num !== 0);

    return new Uint8Array(buffer).buffer;
}

function writeString(string: string): Buffer {
    if (string) {
        let encoded = new TextEncoder().encode(string);
        return Buffer.concat([
            Buffer.from("\x0b"),
            Buffer.from(writeULEB128(encoded.length)),
            Buffer.from(encoded),
        ]);
    } else return Buffer.from([0x00]);
}

function notification(message: string): Buffer {
    return write(ServerPackets.Notification, [[osuTypes.string, message]]);
}

function loginReply(userId: number) {
    return write(ServerPackets.UserID, [[osuTypes.i32, userId]]);
}

function versionUpdate() {
    return write(ServerPackets.VersionUpdate);
}

export {
    writeULEB128,
    writeString,
    write,
    notification,
    loginReply,
    versionUpdate,
};
