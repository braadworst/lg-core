const tape   = require('tape');
const core   = require('../index');

tape('Adding unknown environment', test => {
  const done = road => {
    test.equal(true, true);
    test.end();
  };

  core('webserver')
    .callback('done', done)
    .where('client')
    .where('webserver')
    .run('/', 'done')
    .update({ matchValue: '/' });
});

tape('Callback matching: updateType', test => {
  const done = road => {
    test.equal(road.custom, true);
    test.end();
  };
  const custom = road => {
    road.custom = true;
  };

  core('webserver')
    .callback('done', done)
    .callback('custom', custom)
    .run('/', 'custom', 'hello')
    .run('/', 'done', 'hello')
    .update({ matchValue : '/', updateType : 'hello' });
});

tape('Callback matching', async function(test) {
  const done = road => {
    test.equal(road.count, 1);
    test.equal(road.other, true);
    test.end();
  };

  const count = road => {
    road.count = road.count !== undefined ? road.count + 1 : 0;
  };

  const other = road => {
    road.other = true;
  };

  const instance = core('webserver')
    .callback('done', done)
    .callback('count', count)
    .callback('other', other)
    .run('*', 'count')
    .run('-/', 'count')
    .run('/', 'other')
    .run('-/count', 'count')
    .run('/count', 'count')
    .run('/done', 'count')
    .run('/done', 'done');

  await instance.update({ matchValue : '/' });
  await instance.update({ matchValue : '/count' });
  await instance.update({ matchValue : '/other' });
  await instance.update({ matchValue : '/done' });
});

tape('Callback matching: no match', test => {
  const noMatch = road => {
    test.equal(true, true);
    test.end();
  };

  core('webserver')
    .callback('noMatch', noMatch)
    .fail('noMatch')
    .update({ matchValue : '/' });
});

tape('Callback matching: error', test => {
  const error = road => {
    test.equal(true, true);
    test.end();
  };
  const cause = road => {
    throw new Error('Failing');
  };

  core('webserver')
    .callback('error', error)
    .callback('cause', cause)
    .run('/', 'cause')
    .fail('error')
    .update({ matchValue : '/' })
});

tape('Callback matching: Async error', test => {
  const error = road => {
    test.equal(true, true);
    test.end();
  };

  const cause = async function(road) {
    throw new Error('Failing');
  };

  core('webserver')
    .callback('error', error)
    .callback('cause', cause)
    .run('/', 'cause')
    .fail('error')
    .update({ matchValue : '/' })
});

tape('Passing third party params', test => {
  const done = (road, local, param) => {
    test.equal(param, true);
    test.end();
  };

  core('webserver')
    .callback('done', done)
    .run('/', 'done')
    .update({ matchValue : '/' }, true)
});

tape('Exit loop', async function(test) {

  const one = road => {
    road.one = true;
  };
  const two = road => {
    return 'exit';
  };
  const three = road => {
    road.three = true;
  };

  let temp = await core('webserver')
    .callback('one', one)
    .callback('two', two)
    .callback('three', three)
    .run('/', 'one')
    .run('/', 'two')
    .run('/', 'three')
    .update({ matchValue : '/' })

  test.equal(temp.one, true);
  test.equal(temp.three, undefined);
  test.end();
});
