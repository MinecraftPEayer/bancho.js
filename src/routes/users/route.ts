import { Request, Response } from "express";
import { Database } from "sqlite3";
import { md5 } from "js-md5";

export default {
    POST: (req: Request, res: Response) => {
        if (req.hostname !== `osu.${process.env.SERVER_DOMAIN}`) {
            return res.status(404).send({ status: 404, message: "Not Found" });
        }


        let body = req.body;
        if (
            !body.user ||
            !body.user?.username ||
            !body.user?.user_email ||
            !body.user?.password ||
            !body.check
        ) {
            return res.status(400).send(Buffer.from("Missing required params"));
        }

        let error = {
            username: [],
            user_email: [],
            password: [],
        }

        if (process.env.DISALLOW_INGAME_REGISTER === "true") {
            return res.status(400).send({
                form_error: {
                    user: {
                        password: [
                            "In-game registration is disabled. Please register on the website."
                        ],
                    },
                }
            })
        }


        let user = body.user;

        if (user.username.length < 2 || user.username.length > 15) {
            error['username'].push('Username length must be between 2 and 15')
        }

        if (user.username.includes(" ") && user.username.includes("_")) {
            error['username'].push('Username cannot contain spaces and underscores')
        }

        if (process.env.BLOCKED_USERNAMES.split(",").includes(user.username)) {
            error['username'].push('Username not allowed')
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.user_email)) {
            error['user_email'].push('Invalid email')
        }

        if (user.password.length < 8 || user.password.length > 32) {
            error['password'].push('Password length must be between 8 and 32')
        }

        if (new Set(user.password).size < 3) {
            error['password'].push('Password must contain at least 3 unique characters')
        }

        if (process.env.BLOCKED_PASSWORDS.split(",").includes(user.password)) {
            error['password'].push('Password not allowed')
        }

        let db = new Database(`${process.cwd()}/data/users.db`);
        db.all(
            "SELECT username, user_email FROM accounts",
            (
                err,
                rows: {
                    id: string;
                    username: string;
                    user_email: string;
                    password_md5: string;
                }[]
            ) => {
                if (err) {
                    return res.status(500).send(Buffer.from("Database error"));
                }

                let unavailableUsername = rows.map((row) => row.username);
                if (unavailableUsername.includes(user.username)) {
                    error['username'].push('Username already taken')
                }

                let unavailableEmail = rows.map((row) => row.user_email);
                if (unavailableEmail.includes(user.user_email)) {
                    error['user_email'].push('Email already taken')
                }


                if (error['username'].length + error['user_email'].length + error['password'].length > 0) {
                    let fullError = {
                        username: [error['username'].join('\n')],
                        user_email: [error['user_email'].join('\n')],
                        password: [error['password'].join('\n')]
                    }
                    return res.status(400).send({
                        form_error: {
                            user: fullError
                        }
                    })
                }

                if (error['username'].length + error['user_email'].length + error['password'].length === 0) {
                    if (body.check === '1') return res.send(Buffer.from("ok"));;
                    let password_md5 = md5(user.password);
                    db.run(
                        "INSERT INTO accounts (username, user_email, password_md5) VALUES (?, ?, ?)",
                        [user.username, user.user_email, password_md5]
                    );
                    console.log(`[REGISTER] ${user.username} (${user.user_email})`);
                    res.send(Buffer.from("ok"));
                }
                
            }
        );
    },
};
