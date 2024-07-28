import { IncomingHttpHeaders } from "http";
import OsuVersion from "./classes/OsuVersion";
import { authenticate } from "./mainLib";
import OsuStream from "./enums/OsuStream";
import axios from "axios";
import { loginReply, notification, versionUpdate } from "./packets";
import LoginFailureReason from "./enums/LoginFailureReason";

const OsuAPIv2ChangeLogURL = "https://osu.ppy.sh/api/v2/changelog";

function parseLoginData(data): {
    username: string;
    password_md5: string;
    osu_version: string;
    utc_offset: string;
    display_city: string;
    adapters_string: string;
    adapters_md5: string;
    uninstall_md5: string;
    disk_signatures_md5: string;
    pm_private: string;
} {
    let bodyData = data.replace(/\r/g, "").split("\n");
    let other = bodyData[2].split("|");
    let hashes = other[3]?.split(":");
    return {
        username: bodyData[0],
        password_md5: bodyData[1],
        osu_version: other[0],
        utc_offset: other[1],
        display_city: other[2],
        adapters_string: hashes[1],
        adapters_md5: hashes[2],
        uninstall_md5: hashes[3],
        disk_signatures_md5: hashes[4],
        pm_private: other[4],
    };
}

function parseOsuVersionString(version: string): OsuVersion | undefined {
    let versionRegex =
        /^b(?<date>\d{8})(?:\.(?<revision>\d))?(?<stream>beta|cuttingedge|dev|tourney)?$/;
    let regexTest = versionRegex.exec(version);

    if (!versionRegex.test(version)) return undefined;

    let versionDate = new Date();
    versionDate.setFullYear(parseInt(regexTest.groups.date.slice(0, 4)));
    versionDate.setMonth(parseInt(regexTest.groups.date.slice(4, 6)));
    versionDate.setDate(parseInt(regexTest.groups.date.slice(6, 8)));

    return new OsuVersion(
        versionDate,
        parseInt(regexTest.groups.revision),
        (regexTest.groups.stream ?? "stable") as OsuStream
    );
}

function checkVersion(version: OsuVersion, allowedVersions: Set<Date>): boolean {
    for (let allowedVersion of allowedVersions) {
        let date = version.date
        if (date.getFullYear() === allowedVersion.getFullYear() &&
            date.getMonth() === allowedVersion.getMonth() &&
            date.getDate() === allowedVersion.getDate())
            return true;
    }
    return false
}

async function getAllowedClientVersions(osuStream: OsuStream): Promise<Set<Date> | undefined> {
    let osuStreamString = osuStream.toString();
    if ([OsuStream.STABLE, OsuStream.BETA].includes(osuStream))
        osuStreamString += "40";

    let res = await axios.get(OsuAPIv2ChangeLogURL, {
        params: { 'stream': osuStreamString },
    });
    if (!res.data) return undefined;

    let allowedClientVersion: Set<Date> = new Set();
    for (let build of res.data["builds"]) {
        let ver = new Date();
        ver.setFullYear(parseInt(build["version"].slice(0, 4)));
        ver.setMonth(parseInt(build["version"].slice(4, 6)));
        ver.setDate(parseInt(build["version"].slice(6, 8)));

        allowedClientVersion.add(ver);
        if (build["changelog_entries"].some((entry: any) => entry["major"]))
            break;
    }

    return allowedClientVersion;
}

function parseAdapterString(adapterString: string): [Array<string>, boolean] {
    let RunningUnderWine = adapterString === 'runningunderwine';
    let adapters = adapterString.slice(0, -1).split(".");
    return [adapters, RunningUnderWine];
}

async function handleLogin(
    header: IncomingHttpHeaders,
    body: string,
    ip: string
): Promise<{ header: { [key: string]: string }; body: Buffer }> {
    let loginData = parseLoginData(body);

    let osuVersion = parseOsuVersionString(loginData.osu_version);
    if (!osuVersion) {
        let message = `${process.env.SERVER_DOMAIN}: Please restart your osu! and try again.`;
        return {
            header: { osu_token: "invalid-request" },
            body: Buffer.concat([
                notification(message),
                loginReply(LoginFailureReason.AuthenticationFailed)
            ]),
        };
    }

    const allowedClientVersions = await getAllowedClientVersions(osuVersion.stream);
    if (allowedClientVersions && !checkVersion(osuVersion, allowedClientVersions)) {
        return {
            header: {
                osu_token: 'client-too-old'
            },
            body: Buffer.concat([
                versionUpdate(),
                loginReply(LoginFailureReason.OldClient)
            ])
        }
    }

    let [adapters, RunningUnderWine] = parseAdapterString(loginData.adapters_string);
    if (!(RunningUnderWine || adapters.some(adapter => adapter))) {
        return {
            header: {
                osu_token: 'empty-adapters'
            },
            body: Buffer.concat([
                loginReply(LoginFailureReason.AuthenticationFailed),
                notification(`${process.env.SERVER_DOMAIN}: Please restart your osu! and try again.`)
            ])
        }
    }

    let auth = await authenticate(loginData.username, loginData.password_md5);
    if (!auth) {
        let message = `${process.env.SERVER_DOMAIN}: Incorrect credentials`;
        return {
            header: { osu_token: "incorrect-credentials" },
            body: Buffer.concat([
                notification(message),
                loginReply(LoginFailureReason.AuthenticationFailed)
            ]),
        };
    }
}

export { parseLoginData, parseOsuVersionString, handleLogin };
