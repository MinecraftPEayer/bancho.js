import { Request, Response } from "express";
import { Database } from "sqlite3";
import { md5 } from 'js-md5'

export default {
    POST: (req: Request, res: Response) => {
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

        if (process.env.DISALLOW_INGAME_REGISTER === "true") {
            return res
                .status(400)
                .send(Buffer.from("In-game registration is disabled"));
        }

        let user = body.user;
        let db = new Database(`${process.cwd()}/data/users.db`);

        if (user.username.length < 2 || user.username.length > 15) {
            return res
                .status(400)
                .send(Buffer.from("Username length must be between 2 and 15"));
        }

        if (user.username.includes(" ") && user.username.includes("_")) {
            return res
                .status(400)
                .send(
                    Buffer.from(
                        "Username can't contain spaces and underscores, one is fine"
                    )
                );
        }

        if (process.env.BLOCKED_USERNAMES.split(",").includes(user.username)) {
            return res.status(400).send(Buffer.from("Username not allowed"));
        }

        db.all(
            "SELECT username FROM accounts",
            (
                err,
                rows: {
                    id: string;
                    username: string;
                    user_email: string;
                    password_md5: string;
                }[]
            ) => {
                let unavailableUsername = rows.map((row) => row.username);
                if (unavailableUsername.includes(user.username)) {
                    return res
                        .status(400)
                        .send(Buffer.from("Username already taken"));
                }
            }
        );

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.user_email)) {
            return res.status(400).send(Buffer.from("Invalid email"));
        }

        if (user.password.length < 8 || user.password.length > 32) {
            return res
                .status(400)
                .send(Buffer.from("Password length must be between 8 and 32"));
        }

        if (new Set(user.password).size < 3) {
            return res
                .status(400)
                .send(Buffer.from("Password must have 3 unique characters"));
        }

        if (process.env.BLOCKED_PASSWORDS.split(",").includes(user.password)) {
            return res.status(400).send(Buffer.from("Password not allowed"));
        }

        db.all(
            "SELECT username FROM accounts",
            (
                err,
                rows: {
                    id: string;
                    username: string;
                    user_email: string;
                    password_md5: string;
                }[]
            ) => {
                let unavailableUsername = rows.map((row) => row.username);
                if (unavailableUsername.includes(user.username)) {
                    return res
                        .status(400)
                        .send(Buffer.from("Username already taken"));
                }

                let unavailableEmail = rows.map((row) => row.user_email);
                if (unavailableEmail.includes(user.user_email)) {
                    return res
                        .status(400)
                        .send(Buffer.from("Email already taken"));
                }
            }
        );

        // encode password to md5
        let password_md5 = md5(user.password);

        db.run(
            "INSERT INTO accounts (id, username, user_email, password_md5) VALUES (?, ?, ?, ?)",
            [2, user.username, user.user_email, password_md5]
        );
        res.send(Buffer.from("ok"));
    },
};
