
const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,

    options: {
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate: true
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool;

async function connectDB() {
    try {
        if (pool && pool.connected) {
            return pool;
        }

        pool = await new sql.ConnectionPool(dbConfig).connect();

        console.log("Connected to MSSQL database.");

        return pool;

    } catch (error) {
        console.error("Database connection error:", error.message);
        throw error;
    }
}

module.exports = {
    sql,
    connectDB
};
