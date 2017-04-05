const tape   = require('tape');
const core   = require('../index');
const http   = require('http');

const error = (next, relay, request, response) => {
  next({ error : true });
};

const noMatch = (next, relay, request, response) => {
  next({ noMatch : true });
};

const middleware = (next, relay, request, response) => {
  next({ middleware : true });
};

const emptyNext = (next, relay, request, response) => {
  next();
};

const wildcard = (next, relay, request, response) => {
  next({ wildcard : true });
};

const negative = (next, relay, request, response) => {
  next({ negative : true });
};

const cause = (next, relay, request, response) => {
  throw new Error('Failing');
};

const notObject = (next, relay, request, response) => {
  next(true);
};

tape('Adding unknown environment', test => {
  const server = http.createServer();
  const router = require('lr-server-router')(server);
  const done   = (next, relay, request, response) => {
    test.equal(true, true);
    test.end();
    response.end();
  };

  let road = core('webserver')
    .extension('router', router, true)
    .middleware({ done })
    .where('client')
    .where('webserver')
    .done('done');

  server.listen(4011, function() {});
  http.get('http://localhost:4011', response => {
    server.close();
  });
});

tape('Adding * middleware without match defined should throw', test => {
  test.throws(() => {
    core('client')
      .run('*', 'testMiddleware')
  }, /Define a match before using a wildcard/);
  test.end();
});

tape('Middleware matching: update by id', test => {
  const server = http.createServer();
  const router = require('lr-server-router')(server);

  let custom = update => {
    return {
      go(name) {
        update({ matchId : name });
      }
    }
  }

  let customCaller = (next, relay, request, response) => {
    relay.extensions.custom.go('updater');
    relay.extensions.custom.go('bla');
    response.end();
  };

  let updater = (next, relay) => {
    test.equal(true, true);
    test.end();
    next();
  };

  let road = core('webserver')
    .extension('router', router, true)
    .extension('custom', custom, true)
    .middleware({ customCaller, updater })
    .match('home', '/')
    .match('updater', 'updater')
    .run('home', 'customCaller')
    .run('updater', 'updater');

  server.listen(4010, function() {});
  http.get('http://localhost:4010', response => {
    server.close();
  });
});

tape('Middleware matching: once', test => {
  const server = http.createServer();
  const router = require('lr-server-router')(server);

  let done = (next, relay, request, response) => {
    response.end();
  };

  let count = (next, relay) => {
    next({ count : (relay.count ? relay.count + 1 : 1) });
  }

  let check = (next, relay) => {
    if (relay.check) {
      test.equal(relay.count, 1);
      test.end();
    }
    next({ check : true });
  }

  let road = core('webserver', { resetAfterCycle : false })
    .extension('router', router, true)
    .middleware({ done, count, check })
    .match('home', '/')
    .once('home', 'count')
    .run('home', 'check')
    .done('done');

  server.listen(4009, function() {});
  http.get('http://localhost:4009', response => {
    http.get('http://localhost:4009', response => {
      server.close();
    });
  });
});

tape('Middleware matching: specific, negative, wildcard, no done', test => {
  const server = http.createServer();
  const router = require('lr-server-router')(server);

  let done = (next, relay, request, response) => {
    test.equal(relay.middleware, true);
    test.equal(relay.wildcard, true);
    test.equal(relay.negative, true);
    test.end();
    response.end();
    next(); // not needed just for testing
  };

  let road = core('webserver')
    .extension('router', router, true)
    .middleware({ done, noMatch, error, middleware, wildcard, negative, emptyNext })
    .match('home', '/')
    .match('login', '/login')
    .match('both', 'home', 'login')
    .match('triple', 'both', '/something')
    .run('home', 'emptyNext')
    .run('home', 'middleware')
    .run('-login', 'negative')
    .run('both', 'wildcard')
    .run('*', 'done')

  server.listen(4001, function() {});
  http.get('http://localhost:4001', response => {
    server.close();
  });
});

tape('Middleware matching: noMatch', test => {

  const server = http.createServer();
  const router = require('lr-server-router')(server);

  let done = (next, relay, request, response) => {
    test.equal(relay.noMatch, true);
    test.end();
    response.end();
  };

  let road = core('webserver')
    .extension('router', router, true)
    .middleware({ done, noMatch, error, middleware })
    .noMatch('noMatch')
    .done('done');

  server.listen(4002, function() {});
  http.get('http://localhost:4002', response => {
    server.close();
  });
});

tape('Middleware matching: error', test => {

  const server = http.createServer();
  const router = require('lr-server-router')(server);

  let done = (next, relay, request, response) => {
    test.equal(relay.error, true);
    test.end();
    response.end();
  };

  let road = core('webserver')
    .extension('router', router, true)
    .middleware({ done, noMatch, error, cause })
    .match('home', '/')
    .run('home', 'cause')
    .error('error')
    .done('done');

  server.listen(4003, function() {});
  http.get('http://localhost:4003', response => {
    server.close();
  });
});

tape('Middleware matching: runCustom', test => {

  const server = http.createServer();
  const router = require('lr-server-router')(server);

  let done = (next, relay, request, response) => {
    test.equal(relay.middleware, true);
    test.end();
    response.end();
  };

  let road = core('webserver')
    .extension('router', router, true)
    .middleware({ done, noMatch, error, middleware })
    .match('home', '/')
    .runCustom('home', 'middleware', 'post')
    .done('done');

  server.listen(4004, function() {});
  const request = http.request({
    method : 'POST',
    hostname : 'localhost',
    port: 4004,
    path : '/'
  }, response => {
    server.close();
  });

  request.end();
});

tape('Middleware matching: next not object', test => {

  const server = http.createServer();
  const router = require('lr-server-router')(server);

  let done = (next, relay, request, response) => {
    test.equal(relay.error, true);
    test.end();
    response.end();
  };

  let road = core('webserver')
    .extension('router', router, true)
    .middleware({ done, noMatch, error, notObject })
    .match('home', '/')
    .run('home', 'notObject')
    .error('error')
    .done('done');

  server.listen(4005, function() {});
  http.get('http://localhost:4005', response => {
    server.close();
  });
});

tape('Middleware matching: error no hook', test => {

  const server = http.createServer();
  const router = require('lr-server-router')(server);

  let done = (next, relay, request, response) => {
    test.equal(relay.middleware, true);
    test.end();
    response.end();
  };

  let road = core('webserver')
    .extension('router', router, true)
    .middleware({ done, noMatch, error, cause, middleware })
    .match('home', '/')
    .run('home', 'middleware')
    .run('home', 'cause')
    .done('done');

  server.listen(4006, function() {});
  http.get('http://localhost:4006', response => {
    server.close();
  });
});
