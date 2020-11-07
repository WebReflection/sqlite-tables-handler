# SQLite Tables Handler

[![Build Status](https://travis-ci.com/WebReflection/sqlite-tables-handler.svg?branch=main)](https://travis-ci.com/WebReflection/sqlite-tables-handler) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/sqlite-tables-handler/badge.svg?branch=main)](https://coveralls.io/github/WebReflection/sqlite-tables-handler?branch=main)

A simple helper for SQLite tables development that makes fields re-definition a deadly simple operation.

```js
import sqlite3 from 'sqlite3';
import sqliteHandler from 'sqlite-tables-handler';

const db = new sqlite3.Database(':memory:');
const whenTables = sqliteHandler(db, {
  // tables as keys and fields definition
  person: {
    id: 'INTEGER NOT NULL PRIMARY KEY',
    name: 'TEXT NOT NULL DEFAULT "anonymous"',
    age: 'NUMBER',
    // if we forgot something else we can change it later on
    // age: 'NUMBER NOT NULL DEFAULT 0'
  },
  // fields can change during development
  company: {
    id: 'INTEGER NOT NULL PRIMARY KEY',
    name: 'TEXT NOT NULL',
    // if we forget the employee field we can add it later on
    // employee: 'INTEGER NOT NULL'
  }
});

whenTables.then(() => {
  // ready to go
  // ...
  db.close();
});
```

Too many times, during development, I forget some field, or I decide that the type isn't right, or something else.

With this super basic helper, that's not an issue anymore, as I can change types, add, or remove fields, as I go.

## API

  * `db`, an *sqlite3.Database* instance
  * `object`, an object with tables as keys, and fields as their values

Any more complex table/field operation can be performed a part, but behind the module, a `PRAGMA` check is performed to be sure current fields are the same specified in the existent table, if any, and an automatic upgrade/migration is performed when that's not the case.

Please note *renaming fields* is not supported, as it'd be impossible to guess what's a new name value should be taken from, so for these operations, please alter manually the table and then update the literal object definition to use the same name.


## About Clusters

If multiple forks try simulatenously to migrate one or more tables from one schema to another, disasters might happen.

To prevent such situation, I suggest the usage of [id-promise](https://github.com/WebReflection/id-promise#readme).

```js
import sqlite3 from 'sqlite3';
import sqliteHandler from 'sqlite-tables-handler';

import idPromise from 'id-promise';

const dbPath = './db.sqlite';
const db = new sqlite3.Database(dbPath);

const whenTables = idPromise(
  'sqlite-tables-handler:' + dbPath,
  (resolve, reject) => {
    sqliteHandler(db, {
      my_table: {
        id: 'INTEGER NOT NULL PRIMARY KEY'
      }
    })
    .then(resolve, reject);
  }
);

whenTables.then(() => {
  console.log('SQLite Ready');
  // ...
});
```

Using `id-promise` helper at least to be sure tables are ready will ensure no concurrent migrations should ever happen across forks.

See [test/multi.js](./test/multi.js) file as example.
