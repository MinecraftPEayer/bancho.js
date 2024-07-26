import OsuStream from "../enums/OsuStream";

export default class OsuVersion {
    date: Date;
    revision: number;
    stream: OsuStream;
    
    constructor(date: Date, revision: number, stream: OsuStream) {
        this.date = date;
        this.revision = revision;
        this.stream = stream;
    }
}