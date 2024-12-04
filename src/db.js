const mysql = require('mysql2');
const dotenv = require('dotenv');
const logger = require('./Logger');

dotenv.config();

let connection;

function connectDB() {
    // Check if the connection already exists
    if (connection) {
        logger.info(' connected to MySQL database.');
        return;
    }

    connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    connection.connect((err) => {
        if (err) {
            logger.error('Error connecting to MySQL:', err);
            return;
        }
        // logger.info('Connected to MySQL database.');
    });
}

function getConnection() {
    return connection;
}

module.exports = { connectDB, getConnection };