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

tape('String patters throws: match', test => {
  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.match(fail, 'ok');
    }, /Match id needs to be a string containing only letters and or numbers/);
  });
  test.end();
});

tape('String patters throws: run', test => {
  ['', '@#!', '!@@!#ads'].forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.run(fail, 'middlewareId');
    }, /Match id needs to be a string containing only letters, numbers, - or */);
  });

  test.throws(() => {
    const road = core('client');
    road.run('*something', 'middlewareId');
  }, /Match id needs to be "\*" or a match id, not both/);

  test.throws(() => {
    const road = core('client');
    road.run('-', 'middlewareId');
  }, /Match id cannot be "-" only/);

  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.run('matchId', fail);
    }, /Middleware id needs to be a string containing only letters,numbers and an optional "."/);
  });
  test.end();
});

tape('String patters throws: runCustom', test => {
  ['', '@#!', '!@@!#ads'].forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.runCustom(fail, 'middlewareId', 'updateType');
    }, /Match id needs to be a string containing only letters, numbers, - or */);
  });

  test.throws(() => {
    const road = core('client');
    road.runCustom('*something', 'middlewareId', 'updateType');
  }, /Match id needs to be "\*" or a match id, not both/);

  test.throws(() => {
    const road = core('client');
    road.runCustom('-', 'middlewareId', 'updateType');
  }, /Match id cannot be "-" only/);

  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.runCustom('matchId', fail, 'updateType');
    }, /Middleware id needs to be a string containing only letters,numbers and an optional "."/);
  });

  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.runCustom('matchId', 'middlewareId', fail);
    }, /Update type needs to be a string containing only letters and or numbers/);
  });
  test.end();
});

tape('String patters throws: once', test => {
  ['', '@#!', '!@@!#ads'].forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.once(fail, 'middlewareId');
    }, /Match id needs to be a string containing only letters, numbers, - or */);
  });

  test.throws(() => {
    const road = core('client');
    road.once('*something', 'middlewareId');
  }, /Match id needs to be "\*" or a match id, not both/);

  test.throws(() => {
    const road = core('client');
    road.once('-', 'middlewareId');
  }, /Match id cannot be "-" only/);

  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.once('matchId', fail);
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
