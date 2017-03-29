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

tape('Exists throws: path', test => {
  test.throws(() => {
    core('client')
      .path('home', '/')
      .path('home', '/')
  }, /Path id "home" has already been defined/);
  test.end();
});

tape('Exists throws: run', test => {
  test.throws(() => {
    core('client')
      .run('home', 'middlewareId')
  }, /Path id "home" not found/);
  test.end();
});

tape('Exists throws: runCustom', test => {
  test.throws(() => {
    core('client')
      .runCustom('home', 'middlewareId', 'get')
  }, /Path id "home" not found/);
  test.end();
});

tape('Exists throws: once', test => {
  test.throws(() => {
    core('client')
      .once('home', 'middlewareId')
  }, /Path id "home" not found/);
  test.end();
});
