import { Request, Response } from "express"

export default {
    GET: (req: Request, res: Response) => {
        if (req.hostname === `osu.${process.env.SERVER_DOMAIN}`) {
            res.send('<p>Running bancho.js v0.0.1</p><p>Made with love by MinecraftPEayer</p><p>online players: 1</p>')
        }
    }
}