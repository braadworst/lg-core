const tape = require('tape');
const core = require('../index');

tape('Testing long stack', test => {
  const one = async function(road) {
    const waiter = async function() {
      return new Promise(resolve => {
        setTimeout(() => {
          console.log('one finished');
          resolve();
        }, 1000)
      });
    }
    await waiter();
    return { one : true };
  }
  const two = async function(road) {
    return { two : true };
  }
  const three = async function(road) {
    return { three : true };
  }
  const done = road => {
    test.equal(road.one, true);
    test.equal(road.two, true);
    test.equal(road.three, true);
    test.end();
    next();
  }
  core('webserver')
    .callback('one', one)
    .callback('two', two)
    .callback('three', three)
    .callback('done', done)
    .run('/', 'one')
    .run('/', 'two')
    .run('/', 'three')
    .run('/', 'done')
    .update({ matchValue : '/' })
});
