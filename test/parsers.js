const tape   = require('tape');
const core   = require('../index');

tape('Parsers throws: parsers', test => {
  test.throws(() => {
    core('client', { parsers : [{ add : false }] })
  }, /Parser needs to have a method called add/);
  test.throws(() => {
    core('client', { parsers : [{ add : () => {}, parse : false }] })
  }, /Parser needs to have a method called parse/);
  test.end();
});
