const tape = require('tape');
const core = require('../index');

tape('Return object: environment', test => {
  test.equal(typeof core('client'), 'object');
  test.end();
});

tape('Return object: extension', test => {
  test.equal(typeof core('client').extension('router', {}), 'object');
  test.end();
});

tape('Return object: middleware', test => {
  test.equal(typeof core('client').middleware({ router : () => {} }), 'object');
  test.end();
});

tape('Return object: where', test => {
  test.equal(typeof core('client').where('client'), 'object');
  test.end();
});

tape('Return object: error', test => {
  test.equal(typeof core('client').error('something'), 'object');
  test.end();
});

tape('Return object: noMatch', test => {
  test.equal(typeof core('client').noMatch('something'), 'object');
  test.end();
});

tape('Return object: done', test => {
  test.equal(typeof core('client').done('something'), 'object');
  test.end();
});
