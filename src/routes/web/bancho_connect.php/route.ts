import { Request, Response } from "express"

export default {
    GET: (req: Request, res: Response) => {
        if (req.hostname === `osu.${process.env.SERVER_DOMAIN}`) {
            res.send(Buffer.from(''))
        }
    }
}