const sqlite3 = require('sqlite3');
const idPromise = require('id-promise');

const sqliteHandler = require('../cjs');

const dbPath = './db.sqlite';
const db = new sqlite3.Database(dbPath);

idPromise(
  'sqlite-tables-handler:' + dbPath,
  (resolve, reject) => {
    sqliteHandler(db, {
      my_table: {
        id: 'INTEGER NOT NULL PRIMARY KEY'
      }
    })
    .then(resolve, reject);
  }
)
.then(() => idPromise(
  'sqlite-tables-handler:' + dbPath,
  (resolve, reject) => {
    sqliteHandler(db, {
      my_table: {
        id: 'INTEGER NOT NULL PRIMARY KEY',
        random: 'FLOAT NOT NULL'
      }
    })
    .then(resolve, reject);
  }
))
.then(() => {
  db.all('PRAGMA table_info(my_table)', (_, {length}) => {
    console.assert(length === 2, 'expected 2 fields');
    process.exit(0);
  });
});
