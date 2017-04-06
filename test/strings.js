const tape    = require('tape');
const core    = require('../index');
const fails   = ['', '@#!', '!@@!#ads', '*', '*regular'];

tape('String patters throws: environment', test => {
  fails.forEach(fail => {
    test.throws(() => {
      core(fail);
    }, /Environment id needs to be a string containing only letters and or numbers/);
  });
  test.end();
});

tape('String patters throws: extension', test => {
  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.extension(fail, 'extension');
    }, /Extension id needs to be a string containing only letters and or numbers/);
  });
  test.end();
});

tape('String patters throws: where', test => {
  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.where(fail);
    }, /Environment id needs to be a string containing only letters and or numbers/);
  });
  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.where('client', fail);
    }, /Environment id needs to be a string containing only letters and or numbers/);
  });
  test.end();
});

tape('String patters throws: run', test => {
  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.run('matchId', fail);
    }, /Middleware id needs to be a string containing only letters,numbers and an optional "."/);
  });
  test.end();
});

tape('String patters throws: error', test => {
  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.error(fail);
    }, /Middleware id needs to be a string containing only letters,numbers and an optional "."/);
  });
  test.end();
});

tape('String patters throws: noMatch', test => {
  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.noMatch(fail);
    }, /Middleware id needs to be a string containing only letters,numbers and an optional "."/);
  });
  test.end();
});

tape('String patters throws: done', test => {
  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.done(fail);
    }, /Middleware id needs to be a string containing only letters,numbers and an optional "."/);
  });
  test.end();
});
