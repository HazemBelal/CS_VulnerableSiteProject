// db.js
const mysql = require('mysql2');
const { db: cfg } = require('./config');

// create a connection pool
const pool = mysql.createPool({
  host:               cfg.host,
  user:               cfg.user,
  password:           cfg.password,
  database:           cfg.database,
  port:               cfg.port,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0
});

// export promise-wrapped pool for async/await
module.exports = pool.promise();
