import osuTypes from "./enums/osuTypes";
import { writeString } from "./packets";

const writeType: { [key in osuTypes]: (value: any) => Buffer } = {
    [osuTypes.i8]: (value: any) => Buffer.from([value]),
    [osuTypes.u8]: (value: any) => Buffer.from([value]),
    [osuTypes.i16]: (value: any) => {
        let buffer = Buffer.alloc(2);
        buffer.writeInt16LE(value);
        return buffer;
    },
    [osuTypes.u16]: (value: any) => {
        let buffer = Buffer.alloc(2);
        buffer.writeUInt16LE(value);
        return buffer;
    },
    [osuTypes.i32]: (value: any) => {
        let buffer = Buffer.alloc(4);
        buffer.writeInt32LE(value);
        return buffer;
    },
    [osuTypes.u32]: (value: any) => {
        let buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(value);
        return buffer;
    },
    [osuTypes.f32]: (value: any) => {
        let buffer = Buffer.alloc(4);
        buffer.writeFloatLE(value);
        return buffer;
    },
    [osuTypes.i64]: (value: any) => {
        let buffer = Buffer.alloc(8);
        buffer.writeBigInt64LE(BigInt(value));
        return buffer;
    },
    [osuTypes.u64]: (value: any) => {
        let buffer = Buffer.alloc(8);
        buffer.writeBigUInt64LE(BigInt(value));
        return buffer;
    },
    [osuTypes.f64]: (value: any) => {
        let buffer = Buffer.alloc(8);
        buffer.writeDoubleLE(value);
        return buffer;
    },

    [osuTypes.string]: writeString,
    [osuTypes.i32Array]: (value: number[]) => {
        return Buffer.from('')
    },
    [osuTypes.i32Array4L]: (value: number[]) => {
        return Buffer.from('')
    },
    [osuTypes.scoreframe]: (value: any) => {
        return Buffer.from('')
    },
    [osuTypes.message]: (value: any) => {
        return Buffer.from('')
    },
    [osuTypes.channel]: (value: any) => {
        return Buffer.from('')
    },
    [osuTypes.match]: (value: any) => {
        return Buffer.from('')
    },
    [osuTypes.mapInfoRequest]: (value: any) => {
        return Buffer.from('')
    },
    [osuTypes.mapInfoReply]: (value: any) => {
        return Buffer.from('')
    },
    [osuTypes.replayFrameBundle]: (value: any) => {
        return Buffer.from('')
    },
    [osuTypes.raw]: (value: any) => {
        return Buffer.from('')
    },
}

export default writeType;