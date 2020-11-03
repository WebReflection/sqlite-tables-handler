const sqlite3 = require('sqlite3');
const tablesHandler = require('../cjs');

const db = new sqlite3.Database(':memory:');

const exit = error => {
  console.error(error);
  db.close();
  process.exit(1);
};

console.time('no db');
tablesHandler(null, {
  test: {
    id: 'INTEGER NOT NULL PRIMARY KEY',
    value: 'TEXT'
  }
}).then(() => {
  console.timeEnd('no db');
  console.time('first db');
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
    console.timeEnd('first db');
    db.run('INSERT INTO multi VALUES (' + Math.random() + ')');
    db.run('INSERT INTO test (value) VALUES ("test value")', error => {
      if (error)
        exit(error);
      console.time('same db');
      tablesHandler(db, {
        test: {
          id: 'INTEGER NOT NULL PRIMARY KEY',
          value: 'TEXT'
        }
      }).then(() => {
        console.timeEnd('same db');
        console.time('bigger db');
        tablesHandler(db, {
          test: {
            id: 'INTEGER NOT NULL PRIMARY KEY',
            key: 'TEXT NOT NULL DEFAULT "key"',
            value: 'TEXT'
          }
        })
        .then(() => {
          console.timeEnd('bigger db');
          db.get('SELECT * FROM multi', (_, {random}) => {
            if (typeof random !== 'number')
              exit(new Error('Unexpected multi result'));
          });
          db.get('SELECT * FROM test', (_, {id, key, value}) => {
            if (id !== 1 || key !== 'key' || value !== 'test value')
              exit(new Error('Unexpected test result'));
            console.time('smaller db');
            tablesHandler(db, {
              test: {
                id: 'INTEGER NOT NULL PRIMARY KEY',
                value: 'TEXT'
              }
            }).then(() => {
              console.timeEnd('smaller db');
              console.log('OK');
              db.close();
            });
          });
        }, exit);
      });
    });
  }, exit);
});
