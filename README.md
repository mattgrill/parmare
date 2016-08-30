# Parmare

Run your promises in child processes.

```js
const Parmare = require('parmare');
const parmare = new Parmare({
  promise0: './promises/promise0.js',
  promise1: './promises/promise1.js'}, 2);
```

`Parmare()`
  - `promises`: The promises you want to execute in a child process. As long as each file returns a promise, what happens within them doesn't matter.
  - `runners`: The number of child processes you want to execute your promises.

## TODO
  - Tests

## License
  MIT
