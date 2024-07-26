import { Request, Response } from "express";
import {
    handleLogin,
    parseLoginData,
    parseOsuVersionString,
} from "@/lib/login";

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

            if (!req.headers["osu_token"]) {
                // login
                let loginData = await handleLogin(
                    req.headers,
                    req.body,
                    req.ip
                );

                res.header("cho-token", loginData.header["osu_token"]).send(
                    loginData.body
                );
            }
        });
    },
};
