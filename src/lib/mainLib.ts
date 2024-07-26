import { Database } from "sqlite3";
import { promisify } from "util";
import osuTypes from "./enums/osuTypes";
import writeType from "./writeType";
import ServerPackets from "./enums/ServerPackets";

function parseOsuVersion(version: string): string[] | undefined {
    let versionData = version.slice(1).split(".");
    if (versionData.length !== 3) return undefined;
    return versionData;
}

async function authenticate(username: string, password_md5: string) {
    let db = new Database(`${process.cwd()}/data/users.db`);
    const dbGet = promisify(db.get.bind(db));
    try {
        const row = await dbGet('SELECT * FROM accounts WHERE username = ?', [username]);
        
        if (!row) {
            return false;
        }
        if (row.password_md5 !== password_md5) {
            return false;
        }
        return true;
    } catch (e) {
        return false
    }
}

function write(packId: number, type: osuTypes, data: any) {
    let packIdBuffer = Buffer.from([packId & 0xFF, (packId >> 8) & 0xFF, 0x00])

    let dataBuffer: Buffer
    if (type === osuTypes.raw) {
        dataBuffer = data
    } else {
        dataBuffer = writeType[type](data)
    }

    let sizeBuffer = Buffer.alloc(4)
    let length = Uint8Array.from(packIdBuffer).length + Uint8Array.from(dataBuffer).length
    sizeBuffer.writeInt32LE(length)
    return Buffer.concat([packIdBuffer, sizeBuffer, dataBuffer])
}

function loginReply(userId: number) {
    return write(ServerPackets.UserID, osuTypes.i32, userId)
}

function write_uleb128(num: number): Buffer | ArrayBuffer {
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

export {
    authenticate,
    write,
    write_uleb128
}