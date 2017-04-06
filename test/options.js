const tape   = require('tape');
const core   = require('../index');

tape('Parsers throws: parsers', test => {
  test.throws(() => {
    core('client', { parser : { add : false } })
  }, /Parser needs to have a method called "add"/);

  test.throws(() => {
    core('client', { parser : { add : () => {}, parse : false } })
  }, /Parser needs to have a method called "parse"/);

  test.doesNotThrow(() => {
    core('client', {
      parser : {
        add : () => {},
        parse : () => {}
      }
    });
  }, undefined);

  test.doesNotThrow(() => {
    core('client', { resetAfterCycle : false })
  }, undefined);

  test.end();
});
