const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'assignments.db');

class DbController {
    constructor() {
        this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) return console.log(err.message);
        });
    }

    readFromDb(fullname) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT comment, status FROM assignments WHERE fullname = ?`;
            this.db.get(sql, [fullname], (err, row) => {
                if (err) {
                    console.log(err.message);
                    return reject(err);
                }

                if (row) {
                    resolve(row);
                } else {
                    resolve(null);
                }
            });
        });
    }

    insertIntoDb(fullname, comment, status) {
        const sql = `INSERT INTO assignments(fullname, comment, status) VALUES (?, ?, ?)`;
        return new Promise((resolve, reject) => { 
            this.db.run(sql, [fullname, comment, status], function (err) {
                if (err) {
                    console.log(err.message);
                    return reject(err);
                }
                resolve(this.lastID);
            });
        });
    }

    updateInDb(fullname, comment, status) {
        const sql = `UPDATE assignments SET comment = ?, status = ? WHERE fullname = ?`;
        return new Promise((resolve, reject) => { 
            this.db.run(sql, [comment, status, fullname], function (err) {
                if (err) {
                    console.log(err.message);
                    return reject(err); 
                }
                resolve(this.changes); 
            });
        });
    }
}

module.exports = DbController;