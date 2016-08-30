const uuid = require('uuid');
process.on('message', m => {
  const processID = uuid.v4();

  if (!m.testFiles) {
    process.exit();
  }

  Promise.all(m.testFiles.map(testFile => require(testFile)))
    .then(result => {
      process.send({result: result, id: processID});
      process.exit()
    })
    .catch(err => {
      process.send({error: err, id: processID});
      process.exit()
    })
});
