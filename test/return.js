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

tape('Return object: callback', test => {
  test.equal(typeof core('client').callback('id', () => {}), 'object');
  test.end();
});

tape('Return object: where', test => {
  test.equal(typeof core('client').where('client'), 'object');
  test.end();
});

tape('Return object: fail', test => {
  test.equal(typeof core('client').fail('something'), 'object');
  test.end();
});

tape('Return object: update', test => {
  test.equal(typeof core('client').update({ matchValue : '/' }), 'object');
  test.end();
});
