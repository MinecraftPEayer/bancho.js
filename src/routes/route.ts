import { Request, Response } from "express";
import { authenticate, write } from '@lib/mainLib';
import ServerPackets from "@/lib/enums/ServerPackets";
import osuTypes from "@/lib/enums/osuTypes";

export default {
    GET: (req: Request, res: Response) => {
        if (req.hostname === `c.${process.env.SERVER_DOMAIN}`) {
            res.send("<p>Running bancho.js v0.0.1</p><p>online players: 0</p>");
        }
    },
    POST: (req: Request, res: Response) => {
        if (
            req.hostname !== `c.${process.env.SERVER_DOMAIN}` &&
            req.hostname !== `c4.${process.env.SERVER_DOMAIN}`
        )
            return res.send({ status: 404, message: "Not Found" });

        let data = "";
        req.on("data", (chunk) => {
            data += chunk;
        });
        req.on("end", async () => {
            req.body = data;
            let body = req.body;

            if (!req.headers["osu_token"]) {
                // login
                let bodyData = body.replace(/\r/g, '').split("\n");
                let other = bodyData[2].split("|");
                let hashes = other[3]?.split(":");
                let loginData = {
                    username: bodyData[0],
                    password_md5: bodyData[1],
                    other: {
                        osu_version: other[0],
                        utc_offset: other[1],
                        display_city: other[2],
                        client_hashes: {
                            osu_version: hashes[0],
                            adapters_string: hashes[1],
                            adapters_md5: hashes[2],
                            uninstall_md5: hashes[3],
                            disk_signatures_md5: hashes[4],
                        },
                        pm_private: other[4],
                    },
                };

                let auth = await authenticate(loginData.username, loginData.password_md5);
                if (!auth) {
                    let stringToWrite = `${process.env.SERVER_DOMAIN}: Incorrect credentials`;
                    return res.setHeader('cho-token', 'incorrect-credentials').send(Buffer.concat([write(ServerPackets.Notification, osuTypes.string, stringToWrite), write(ServerPackets.UserID, osuTypes.i32, -1)]));
                }
            }
        });
    },
};
