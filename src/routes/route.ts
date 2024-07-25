import { Request, Response } from "express";

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
        req.on("end", () => {
            req.body = data;
            let body = req.body;

            if (!req.headers["osu_token"]) {
                let bodyData = body.split("\n");
                let other = bodyData[2].split("|");
                let loginData = {
                    username: bodyData[0],
                    password: bodyData[1],
                    other: {
                        osu_version: other[0],
                        utc_offset: other[1],
                        display_city: other[2],
                        client_hashes: other[3],
                        pm_private: other[4],
                    },
                };
            }
        });
    },
};
