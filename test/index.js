const sqlite3 = require('sqlite3');
const tablesHandler = require('../cjs');

const db = new sqlite3.Database(':memory:');

const exit = error => {
  console.error(error);
  db.close();
  process.exit(1);
};

tablesHandler(null, {
  test: {
    id: 'INTEGER NOT NULL PRIMARY KEY',
    value: 'TEXT'
  }
}).then(() => {
  tablesHandler(db, {
    test: {
      id: 'INTEGER NOT NULL PRIMARY KEY',
      value: 'TEXT'
    },
    multi: {
      random: 'FLOAT'
    }
  })
  .then(() => {
    db.run('INSERT INTO multi VALUES (' + Math.random() + ')');
    db.run('INSERT INTO test (value) VALUES ("test value")', error => {
      if (error)
        exit(error);
      tablesHandler(db, {
        test: {
          id: 'INTEGER NOT NULL PRIMARY KEY',
          value: 'TEXT'
        }
      }).then(() => {
        tablesHandler(db, {
          test: {
            id: 'INTEGER NOT NULL PRIMARY KEY',
            key: 'TEXT NOT NULL DEFAULT "key"',
            value: 'TEXT'
          }
        })
        .then(() => {
          db.get('SELECT * FROM multi', (_, {random}) => {
            if (typeof random !== 'number')
              exit(new Error('Unexpected multi result'));
          });
          db.get('SELECT * FROM test', (_, {id, key, value}) => {
            if (id !== 1 || key !== 'key' || value !== 'test value')
              exit(new Error('Unexpected test result'));
            tablesHandler(db, {
              test: {
                id: 'INTEGER NOT NULL PRIMARY KEY',
                value: 'TEXT'
              }
            }).then(() => {
              console.log('OK');
              db.close();
            });
          });
        }, exit);
      });
    });
  }, exit);
});
