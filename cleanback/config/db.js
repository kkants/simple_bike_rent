require('dotenv').config();
const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
  process.env.PG_DB,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    dialect: 'postgres',
    host: process.env.HOST,
    port: process.env.DB_PORT,
  }
);
