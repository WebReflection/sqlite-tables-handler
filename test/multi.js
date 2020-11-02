const cluster = require('cluster');
let numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  require('id-promise');

  console.log(`Master is creating ${numCPUs} forks`);
  for (let i = 0; i < numCPUs; i++)
    cluster.fork();

  cluster.on('exit', () => {
    if (!--numCPUs)
      require('fs').unlink('./db.sqlite', () => {
        console.log('Done');
      });
  });
}
else
  require('./fork.js');
