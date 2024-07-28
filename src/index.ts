import express from "express";
import multer from 'multer'
import * as fs from "fs";
import "dotenv/config";
import MainApplication from "./lib/classes/MainApplication";

process.app = new MainApplication();

const app = express();

app.use(express.json());
app.use(express.text({ type: 'text/*'}))
app.use(express.urlencoded({ extended: true }));

// 獲取所有路由
let routes = {};
function getRoutes(path: string) {
    let items = fs
        .readdirSync(path)
        .filter(
            (item) =>
                item === "route.ts" ||
                fs.statSync(`${path}/${item}`).isDirectory()
        );
    for (let item of items) {
        if (fs.statSync(`${path}/${item}`).isDirectory()) {
            getRoutes(`${path}/${item}`);
        } else {
            let route = `${path}/${item}`
                .replace("/route.ts", "")
                .replace(/;/g, ':')
                .replace("src/routes", "");
            if (route === '') route = '/'
            routes[route] = `${path}/${item}`;
        }
    }
}
getRoutes("src/routes");


app.use(async (req, res, next) => {
    let method = req.method;
    let route = req.path;

    if (routes[route]) {
        let routeModule = await import(`./${routes[route]}?t=${Date.now()}`.replace('src/', ''));
        console.log(`[${method}] ${req.hostname}${route}`);
        if (routeModule.default[method]) {
            if (method === 'POST' && req.headers['content-type']?.includes('multipart/form-data')) {
                let upload = multer()
                upload.none()(req, res, () => {
                    routeModule.default[method](req, res);
                })
            } else routeModule.default[method](req, res);
        } else {
            res.status(404).send({ status: 404, message: `Not Found` });
        }
    } else {
        res.status(404).send({ status: 404, message: `Not Found` });
    }
})

import https from "https";
const server = https.createServer(
    {
        cert: fs.readFileSync(
            process.env.SSL_CERT_PATH.replace("@", process.cwd())
        ),
        key: fs.readFileSync(
            process.env.SSL_KEY_PATH.replace("@", process.cwd())
        ),
    },
    app
);

server.listen(443, () => {
    console.log("Server is running on https://localhost:443");
});