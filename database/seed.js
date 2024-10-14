const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./assignments.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.log(err.message);
});

const runSQL = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

db.serialize(async () => {
    try {
        await runSQL(`DROP TABLE IF EXISTS assignments`);
        await runSQL(`CREATE TABLE assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            comment TEXT,
            status TEXT DEFAULT 'not_graded'
        )`);

        console.log("Table assignments got reset successfully.");
    } catch (err) {
        console.error("SQL Error: ", err.message);
    } finally {
        db.close();
    }
});
