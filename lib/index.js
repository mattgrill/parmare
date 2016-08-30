const childProcess = require('child_process');
const objectAssign = require('object-assign');
const path = require('path');

module.exports = class Parmare {
  constructor(promises, runners) {
    this.promises = promises;
    this.runners = runners;

    this.promiseKeys = Object.keys(this.promises);
    this.promiseGroups = this.promiseKeys.reduce((a, i) => {
      if (a[a.length - 1].length >= this.promiseKeys.length / this.runners) {
        a.push([])
      }
      let promiseObject = {};
      promiseObject[i] = this.promises[i]
      a[a.length - 1].push(promiseObject);
      return a;
    }, [[]]);

    this.basePath = path.dirname(require.main.filename);
  }

  run() {
    return Promise.all(
      this.promiseGroups.map(promises => this.spawnWorker(promises))
    );
  }

  spawnWorker(promises) {
    const env = process.env;
    // Ensure NODE_PATH paths are absolute
    if (env.NODE_PATH) {
      env = objectAssign({}, env);
      env.NODE_PATH = env.NODE_PATH
        .split(path.delimiter)
        .map(x => path.resolve(x))
        .join(path.delimiter);
    }

    const opts = {
      basePath: this.basePath,
      baseDir: process.cwd(),
      tty: process.stdout.isTTY ? {
        columns: process.stdout.columns,
        rows: process.stdout.rows
      } : false
    };

    const child = childProcess.fork(path.join(__dirname, 'runner.js'), [JSON.stringify(opts)], {
      cwd: this.basePath,
      env: env,
      execArgv: process.execArgv
    });

    const promiseFiles = promises.map(promise => path.join(this.basePath, promise[Object.keys(promise)[0]]));

    return new Promise((resolve, reject) => {
      child.on('message', m => {
        return (m.result ? resolve(m) : reject(m));
      });
      child.send({promiseFiles: promiseFiles});
    });
  }
}
