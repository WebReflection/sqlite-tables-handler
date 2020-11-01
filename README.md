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
    age: 'NUMBER'
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

  * `db`, an SQLite db instance or `null`, to resolve right away in production
  * `object`, an object with tables as keys, and fields as their values

Any more complex table/field operation can be performed a part, but behind the module a `PRAGMA` check is performed to be sure current fields are the same specified in the existent table, if any, and an automatic upgrade/migration is performed when that's not the case.

Please note *renaming fields* is not supported, as it'd be impossible to guess what's a new name value should be taken from, so for these operations, please alter manually the table and then update the literal object definition to use the same name.
