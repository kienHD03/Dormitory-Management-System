require("dotenv").config();
const sql = require("mssql");
const { DB_USER, DB_PASSWORD, DB_SERVER, DB_DATABASE } = process.env;

// SQL Server configuration
const config = {
  user: DB_USER, // SQL Server username
  password: DB_PASSWORD, // Your password
  server: DB_SERVER, // Server name or IP address
  database: DB_DATABASE, // Database name
  options: {
    encrypt: true, // Set to true if you're using SQL Azure
    trustServerCertificate: true, // Set to true for local development with self-signed certs
  },
};

// Function to connect to SQL Server
function connectToDB() {
  try {
    sql.connect(config);
    console.log("Successfully connected to SQL Server");
  } catch (err) {
    console.error("Connection error:", err);
  }
}

module.exports = connectToDB;
