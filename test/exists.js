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

tape('Exists throws: match', test => {
  test.throws(() => {
    core('client')
      .match('home', '/home')
      .match('home', '/')
  }, /Match id "home" has already been defined/);
  test.throws(() => {
    core('client')
      .match('home', '/')
      .match('login', '/')
  }, /Match value "\/" has already been defined/);
  test.throws(() => {
    core('client')
      .match('home', '/')
      .match('login', '/login')
      .match('both', 'home', 'login', '/')
  }, /Match value "\/" has already been defined/);
  test.throws(() => {
    core('client')
      .match('home', '/')
      .match('login', '/login')
      .match('both', 'home', 'login', 'login')
  }, /Cannot have duplicates as values/);
  test.throws(() => {
    core('client')
      .match('home', '/')
      .match('login', '/login')
      .match('both', 'home', 'login', '/somethingnew')
      .match('triple', 'both', 'login')
  }, /You are grouping values that both contain the same base value/);
  test.throws(() => {
    core('client')
      .match('home', '/')
      .match('login', '/login')
      .match('both', 'home', 'login', '/somethingnew')
      .match('triple', 'both', '/somethingnew')
  }, /You are grouping values that both contain the same base value/);
  test.end();
});

tape('Exists throws: run', test => {
  test.throws(() => {
    core('client')
      .run('home', 'middlewareId')
  }, /Match id "home" not found/);
  test.end();
});

tape('Exists throws: runCustom', test => {
  test.throws(() => {
    core('client')
      .runCustom('home', 'middlewareId', 'get')
  }, /Match id "home" not found/);
  test.end();
});

tape('Exists throws: once', test => {
  test.throws(() => {
    core('client')
      .once('home', 'middlewareId')
  }, /Match id "home" not found/);
  test.end();
});
