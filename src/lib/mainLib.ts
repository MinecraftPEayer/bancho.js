import { Database } from "sqlite3";
import { promisify } from "util";

async function authenticate(username: string, password_md5: string) {
    let db = new Database(`${process.cwd()}/data/users.db`);
    const dbGet = promisify(db.get.bind(db));
    try {
        const row = await dbGet('SELECT * FROM accounts WHERE username = ?', [username]);
        
        if (!row) {
            return false;
        }
        if (row.password_md5 !== password_md5) {
            return false;
        }
        return true;
    } catch (e) {
        return false
    }
}

export {
    authenticate,
}