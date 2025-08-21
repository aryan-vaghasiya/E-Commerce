const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "e_comm_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
})

const runQuery = async (query, values) => {
    const [results] = await pool.query(query, values);
    return results;
}

// const runNow = async (query, values) => {
//     const results = await pool.query(query, values);
//     console.log(results);
//     return results;
// }
// runNow(`SELECT * FROM wallets`)

module.exports = runQuery;
// module.exports = pool;