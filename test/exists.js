const tape = require('tape');
const core = require('../index');

tape('Exists throws: extension', test => {
  test.throws(() => {
    core('client')
      .extension('update', 'update')
  }, /"update" has already been defined as an extension/);
  test.end();
});
