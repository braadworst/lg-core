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

tape('String patters throws: path', test => {
  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.path(fail, 'ok');
    }, /Path id needs to be a string containing only letters and or numbers/);
  });
  test.end();
});

tape('String patters throws: run', test => {
  ['', '@#!', '!@@!#ads'].forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.run(fail, 'middlewareId');
    }, /Path id needs to be a string containing only letters, numbers, - or */);
  });

  test.throws(() => {
    const road = core('client');
    road.run('*something', 'middlewareId');
  }, /Path id needs to be "\*" or a path id, not both/);

  test.throws(() => {
    const road = core('client');
    road.run('-', 'middlewareId');
  }, /Path id cannot be "-" only/);

  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.run('pathId', fail);
    }, /Middleware id needs to be a string containing only letters and or numbers/);
  });
  test.end();
});

tape('String patters throws: runCustom', test => {
  ['', '@#!', '!@@!#ads'].forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.runCustom(fail, 'middlewareId', 'updateType');
    }, /Path id needs to be a string containing only letters, numbers, - or */);
  });

  test.throws(() => {
    const road = core('client');
    road.runCustom('*something', 'middlewareId', 'updateType');
  }, /Path id needs to be "\*" or a path id, not both/);

  test.throws(() => {
    const road = core('client');
    road.runCustom('-', 'middlewareId', 'updateType');
  }, /Path id cannot be "-" only/);

  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.runCustom('pathId', fail, 'updateType');
    }, /Middleware id needs to be a string containing only letters and or numbers/);
  });

  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.runCustom('pathId', 'middlewareId', fail);
    }, /Update type needs to be a string containing only letters and or numbers/);
  });
  test.end();
});

tape('String patters throws: once', test => {
  ['', '@#!', '!@@!#ads'].forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.once(fail, 'middlewareId');
    }, /Path id needs to be a string containing only letters, numbers, - or */);
  });

  test.throws(() => {
    const road = core('client');
    road.once('*something', 'middlewareId');
  }, /Path id needs to be "\*" or a path id, not both/);

  test.throws(() => {
    const road = core('client');
    road.once('-', 'middlewareId');
  }, /Path id cannot be "-" only/);

  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.once('pathId', fail);
    }, /Middleware id needs to be a string containing only letters and or numbers/);
  });
  test.end();
});

tape('String patters throws: error', test => {
  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.error(fail, 'middlewareId');
    }, /Middleware id needs to be a string containing only letters and or numbers/);
  });
  test.end();
});

tape('String patters throws: noMatch', test => {
  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.noMatch(fail, 'middlewareId');
    }, /Middleware id needs to be a string containing only letters and or numbers/);
  });
  test.end();
});

tape('String patters throws: done', test => {
  fails.forEach(fail => {
    test.throws(() => {
      const road = core('client');
      road.done(fail, 'middlewareId');
    }, /Middleware id needs to be a string containing only letters and or numbers/);
  });
  test.end();
});
