const SCHEMA = ['name', 'type', 'notnull', 'dflt_value', 'pk'];

const {keys} = Object;

const create = (db, table, definition) => new Promise((res, rej) => {
  const TABLE = escape(table);
  const COLS = keys(definition);
  db.all(`PRAGMA table_info('${TABLE}')`, (_, cols) => {
    const {length} = cols;
    const fields = COLS.map(defined, definition);
    const BCK = `tmp_${TABLE}_backup`;
    const query = `CREATE TABLE IF NOT EXISTS '${length ? BCK : TABLE}' (${join(fields)})`;
    if (length) {
      db.run(query, err => {
        /* istanbul ignore if */
        if (err) rej(err);
        else {
          db.all(`PRAGMA table_info('${BCK}')`, (_, b_cols) => {
            if (
              cols.length !== b_cols.length ||
              cols.some(isDifferentFrom, b_cols)
            ) {
              const names = cols.filter(knownColumns, b_cols)
                                .map(col => `'${escape(col.name)}'`);
              const values = names.map(name => `'${TABLE}'.${name}`);
              db.run(`INSERT INTO '${BCK}' (${join(names)})
                      SELECT ${join(values)} FROM '${TABLE}'`, err => {
                /* istanbul ignore if */
                if (err) db.run(`DROP TABLE IF EXISTS '${BCK}'`, () => rej(err));
                else {
                  db.run(`DROP TABLE IF EXISTS '${TABLE}'`, () => {
                    db.run(`ALTER TABLE '${BCK}' RENAME TO '${TABLE}'`, res);
                  });
                }
              });
            }
            else
              db.run(`DROP TABLE IF EXISTS '${BCK}'`, res);
          });
        }
      });
    }
    else {
      db.run(query, err => {
          /* istanbul ignore if */
          if (err) rej(err);
          else res();
      });
    }
  });
});

const escape = s => s.replace(/'/g, "''");

const join = a => a.join(', ');

export default (db, tables) => new Promise((res, rej) => {
  const queries = [];
  for (const table of keys(tables))
    queries.push(create(db, table, tables[table]));
  Promise.all(queries).then(res, rej);
});

function knownColumns(col) {
  return -1 < this.findIndex(({name}) => name === col.name);
}

function defined(field) {
  return `'${escape(field)}' ${this[field]}`;
}

function isDifferentFrom(col, i) {
  const other = this[i];
  return SCHEMA.some(key => col[key] !== other[key]);
}
