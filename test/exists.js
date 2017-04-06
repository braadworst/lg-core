const tape = require('tape');
const core = require('../index');

tape('Exists throws: extension', test => {
  test.throws(() => {
    core('client')
      .extension('router', 'router')
      .extension('router', 'router')
  }, /"router" has already been defined as an extension/);
  test.end();
});

tape('Exists throws: middleware', test => {
  test.throws(() => {
    core('client')
      .middleware({ router : () => {} })
      .middleware({ router : () => {} })
  }, /"router" has already been defined as middleware/);
  test.end();
});
