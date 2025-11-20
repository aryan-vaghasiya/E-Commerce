// const mysql = require("mysql2/promise");
// const dotenv = require('dotenv');

// dotenv.config();

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//     decimalNumbers: true
// })

// const runQuery = async (query, values) => {
//     const [results] = await pool.query(query, values);
//     return results;
// }

// module.exports = runQuery;




const mysql = require("mysql2/promise");
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
};

if (process.env.DB_HOST !== 'localhost') {
    dbConfig.ssl = {
        rejectUnauthorized: true
    };
}

const pool = mysql.createPool(dbConfig);

(async () => {
    try {
        const conn = await pool.getConnection();    // returns a Promise
        console.log("Successfully connected to database pool at", process.env.DB_HOST);
        conn.release();
    } catch (err) {
        console.error("Error connecting to database:", err);
        // optionally process.exit(1);
    }
})();

const runQuery = async (query, values) => {
    const [results] = await pool.query(query, values);
    return results;
}

module.exports = runQuery;