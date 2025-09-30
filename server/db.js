const mysql = require("mysql2/promise");
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
})

const runQuery = async (query, values) => {
    const [results] = await pool.query(query, values);
    // console.log(pool.format(query, values))
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