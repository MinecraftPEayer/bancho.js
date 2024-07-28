import { Database } from "sqlite3";
import * as path from "path";

class DatabaseManager {
    filePath: string;
    db: Database;
    tables: string[]

    constructor(filePath: string) {
        this.filePath = filePath.replace(/@/g, path.join(process.cwd(), '..'));
        this.db = new Database(this.filePath)
        let tables = this.db.run(`SELECT name FROM sqlite_master WHERE type='table'`)
        this.db.run(`SELECT name FROM PRAGMA_TABLE_INFO()`)
    }

    createTable(name: string, columns: string[]): DatabaseTable {
        let result: boolean;
        this.db.run(`CREATE TABLE ${name} (${columns.join(",")})`, (run, err) => {
            if (err) {
                console.error(err)
                result = false
                return 
            }
            result = true
        })

        return
    }

    getTable(name: string): DatabaseTable {
        return new DatabaseTable(name, this.db);
    }
}

class DatabaseTable {
    name: string;
    columns: string[]
    db: Database

    constructor(name: string, db: Database) {
        this.name = name;
        this.db = db;
    }

    async get(filter: string) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.name} WHERE ${filter}`, (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(row)
                }
            })
        })
    }

    insert(columns: string[], values: any[]) {
        this.db.run(`INSERT INTO ${this.name}(${columns.join(", ")}) VALUES(${values.map(value => typeof value === 'string' ? `'${value.replace(/'/g, '"')}'` : value).join(", ")})`)
    }

    update(filter: string, columns: string[], values: any[]) {
        let vl = '';
        for (let i = 0; i < columns.length; i++) {
            vl += `${i === 0 ? '' : ', '}${columns[i]} = ${typeof values[i] === 'string' ? `'${values[i].replace(/'/g, '"')}'` : values[i]}`
        }
        this.db.run(`UPDATE ${this.name} SET ${vl} WHERE ${filter}`)
    }

    delete(filter: string) {
        this.db.run(`DELETE FROM ${this.name} WHERE ${filter}`)
    }
}

export { DatabaseManager, DatabaseTable }