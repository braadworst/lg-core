const tape = require('tape');
const core = require('../index');

tape('Exact throws: middleware', test => {
  test.throws(() => { core('client').middleware({}, {}); }, /Middleware needs exactly one argument/);
  test.end();
});
