const tape   = require('tape');
const core   = require('../index');

tape('Race condition', test => {
  const done = (next, relay) => {
    console.log('Race: done')
    test.equal(relay.first, true);
    test.equal(relay.second, true);
    test.equal(relay.both, false);
    test.end();
    next();
  };
  const first = async function(next) {
    const waiter = async function() {
      return new Promise(resolve => {
        setTimeout(() => {
          console.log('Race: first');
          resolve();
        }, 1000)
      });
    }
    await waiter();
    next({ both : true, first : true })
  };
  const last  = next => {
    console.log('Race: second');
    next({ both : false, second : true });
  }

  core('webserver', { resetAfterCycle : false })
    .middleware({ done, first, last })
    .run('/first', 'first')
    .run('/last', 'last')
    .run('/last', 'done')
    .update({ matchValue : '/first' })
    .update({ matchValue : '/last' });
});
