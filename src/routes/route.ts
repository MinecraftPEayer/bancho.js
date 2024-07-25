import { Request, Response } from "express";

export default {
    GET: (req: Request, res: Response) => {
        if (req.hostname === `c.${process.env.SERVER_DOMAIN}`) {
            res.send('<p>Running bancho.js v0.0.1</p><p>online players: 0</p>')
        }
    },
    POST: (req: Request, res: Response) => {
        if (req.hostname !== `c.${process.env.SERVER_DOMAIN}` && req.hostname !== `c4.${process.env.SERVER_DOMAIN}`) return
        console.log(req.body)
        res.send(req.body)
    }
}