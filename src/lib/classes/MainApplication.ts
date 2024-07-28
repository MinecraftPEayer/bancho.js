import { DatabaseManager } from "./DatabaseManager";

class MainApplication {
    inMemDB: DatabaseManager
    constructor() {
        this.inMemDB = new DatabaseManager(":memory:")
        this.inMemDB.createTable('logins', ['id STRING', 'ip STRING', 'osuVersion STRING', 'osuStream STRING'])
    }
}

export default MainApplication;