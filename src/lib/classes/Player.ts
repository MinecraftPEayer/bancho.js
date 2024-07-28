import ClanPrivileges from "../enums/ClanPrivileges";
import Privileges from "../enums/Privileges";
import Geolocation from "../interfaces/Geolocation";
import ClientDetails from "./ClientDetails";

type PlayerConsutructorOptions = {
    id: number
    name: string
    priv: Privileges[]
    pwBcrypt: string
    token: string
    clanID: number
    clanPriv: ClanPrivileges[]
    geolocation: Geolocation
    UTCOffset: number
    PMPrivate: boolean
    silenceEnd: number
    donorEnd: number
    clientDetails: ClientDetails
    loginTime: number
    isTourneyClient: boolean
    APIKey: string
}

class Player {
    id: number
    name: string
    priv: Privileges[]
    pwBcrypt: string
    token: string
    clanID: number
    clanPriv: ClanPrivileges[]
    geolocation: Geolocation
    UTCOffset: number
    PMPrivate: boolean
    silenceEnd: number
    donorEnd: number
    clientDetails: ClientDetails
    loginTime: number
    isTourneyClient: boolean
    APIKey: string

    constructor(options: PlayerConsutructorOptions) {
        this.id = options.id;
        this.name = options.name;
        this.priv = options.priv;
        this.pwBcrypt = options.pwBcrypt;
        this.token = options.token;
        this.clanID = options.clanID;
        this.clanPriv = options.clanPriv;
        this.geolocation = options.geolocation;
        this.UTCOffset = options.UTCOffset;
        this.PMPrivate = options.PMPrivate;
        this.silenceEnd = options.silenceEnd;
        this.donorEnd = options.donorEnd;
        this.clientDetails = options.clientDetails;
        this.loginTime = options.loginTime;
        this.isTourneyClient = options.isTourneyClient;
        this.APIKey = options.APIKey;
    }
}

export default Player;