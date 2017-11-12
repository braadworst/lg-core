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

tape('Callback matching: wildcard', test => {
  const done = road => {
    test.equal(road.wildcard, true);
    test.end();
  };
  const wildcard = road => {
    return { wildcard : true };
  };

  core('webserver')
    .callback('done', done)
    .callback('wildcard', wildcard)
    .run('*', 'wildcard')
    .run('/', 'done')
    .update({ matchValue : '/' });
});

tape('Callback matching: updateType', test => {
  const done = road => {
    test.equal(road.custom, true);
    test.end();
  };
  const custom = road => {
    return { custom : true };
  };

  core('webserver')
    .callback('done', done)
    .callback('custom', custom)
    .run('/', 'custom', 'hello')
    .run('/', 'done', 'hello')
    .update({ matchValue : '/', updateType : 'hello' });
});

tape('Callback matching: minus', test => {
  const done = road => {
    test.equal(road.yes, true);
    test.equal(road.no, true);
    test.equal(road.not, undefined );
    test.end();
  };
  const yes = road => {
    return { yes : true };
  };
  const no = road => {
    return { no : true };
  };
  const not = road => {
    return { not : true };
  };

  core('webserver')
    .callback('done', done)
    .callback('yes', yes)
    .callback('no', no)
    .run('/yes', 'yes')
    .run('/not', 'not')
    .run('-/', 'no')
    .run('/yes', 'done')
    .update({ matchValue : '/yes' });
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
