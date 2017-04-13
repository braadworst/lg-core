const tape = require('tape');
const core = require('../index');

tape('Testing long stack', test => {
  const one = async function(next) {
    const waiter = async function() {
      return new Promise(resolve => {
        setTimeout(() => {
          console.log('one finished');
          resolve();
        }, 1000)
      });
    }
    await waiter();
    next({ one : true });
  }
  const two = async function(next) {
    next({ two : true });
  }
  const three = async function(next) {
    next({ three : true });
  }
  const done = (next, relay) => {
    test.equal(relay.one, true);
    test.equal(relay.two, true);
    test.equal(relay.three, true);
    test.end();
    next();
  }
  core('webserver')
    .middleware({ done, one, two, three })
    .run('/', 'one')
    .run('/', 'two')
    .run('/', 'three')
    .done('done')
    .update({ matchValue : '/' })
});
