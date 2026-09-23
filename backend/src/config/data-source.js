require('reflect-metadata');
const { DataSource } = require('typeorm');
const User = require('../entities/User');
const Task = require('../entities/Task');

// Tests set NODE_ENV=test and use an in-memory database so the real
// database file is never touched by the test suite.
const isTest = process.env.NODE_ENV === 'test';

const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: isTest ? ':memory:' : process.env.DATABASE_PATH || './data/database.sqlite',
  synchronize: true, // fine for this size of project; would use migrations in production
  logging: false,
  entities: [User, Task],
});

module.exports = { AppDataSource };
