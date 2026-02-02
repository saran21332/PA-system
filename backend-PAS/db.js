const pgp = require('pg-promise')();

const cn = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pas',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 5432,
};

const db = pgp(cn);

module.exports = db;