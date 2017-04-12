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

tape('Middleware matching: specific, negative, wildcard, no done', test => {
  const server = http.createServer();
  const router = require('lr-server-router')(server);

  let done = (next, relay, request, response) => {
    test.equal(relay.wildcard, true);
    test.end();
    response.end();
    next(); // not needed just for testing
  };

  let road = core('webserver')
    .extension('router', router, true)
    .middleware({ done, wildcard })
    .run('*', 'wildcard')
    .done('done');

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
    .run('/home', 'cause')
    .error('error')
    .done('done');

  server.listen(4003, function() {});
  http.get('http://localhost:4003/home', response => {
    server.close();
  });
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
    .run('/', 'notObject')
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

  let road = core('webserver', { resetAfterCycle : false })
    .extension('router', router, true)
    .middleware({ done, cause, middleware })
    .run('/', 'middleware')
    .run('/', 'cause')
    .done('done');

  server.listen(4006, function() {});
  http.get('http://localhost:4006', response => {
    server.close();
  });
});

tape('Early exit', test => {

  const server = http.createServer();
  const router = require('lr-server-router')(server);

  let done = (next, relay, request, response) => {
    response.end();
    test.equal(relay.exit(), undefined);
    test.end();
  };

  let road = core('webserver', { resetAfterCycle : false })
    .extension('router', router, true)
    .middleware({ done })
    .run('/', 'done');

  server.listen(4007, function() {});
  http.get('http://localhost:4007', response => {
    server.close();
  });
});

tape('Update without type', test => {

  const server  = http.createServer();

  let done = (next, relay) => {
    next();
    test.equal(true, true);
    test.end();
  };

  let empty = next => { setTimeout(() => { next() }, 10) };

  let road = core('webserver', { resetAfterCycle : false })
    .middleware({ done, empty })
    .run('/other', 'done')
    .run('/', 'empty')
    .run('/', 'empty')
    .run('/', 'empty')
    .run('/', 'empty')
    .run('/', 'empty')
    .run('/', 'empty')
    .run('/', 'empty')
    .run('/', 'empty')
    .update({ matchValue : '/other' })
    .update({ matchValue : '/' })
    .update({ matchValue : '/' })
});

tape('Update without middleware', test => {

  const server  = http.createServer();

  let road = core('webserver')
    .update({ matchValue : '/other' });

  test.equal(true, true);
  test.end();
});
