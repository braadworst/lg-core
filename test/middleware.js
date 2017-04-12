const tape = require('tape');
const core = require('../index');
const http = require('http');

tape('Middleware: not a function', test => {
  test.throws(() => {
    core('client')
      .middleware({
        static : {}
      })
  }, /"static" middleware is not a function/);
  test.throws(() => {
    core('client')
      .middleware({
        static : () => {}
      }, 'static', true)
  }, /All traditional middleware names need to be strings/);
  test.throws(() => {
    core('client')
      .middleware({
        static : () => {}
      }, 'static', 'static')
  }, /Duplicate values found for traditional middleware "static"/);
  test.throws(() => {
    core('client')
      .middleware({
        static : () => {}
      }, 'static')
      .middleware({
        something : () => {}
      }, 'static')
  }, /"static" has already been defined as a traditional middleware function/);
  test.end();
});

tape('Testing relay middleware', test => {
  const server = http.createServer();
  const router = require('lr-server-router')(server);
  const done   = (next, relay, request, response) => {
    test.equal(request.url, '/');
    test.end();
    response.end();
  };
  let road = core('webserver')
    .extension('router', router, true)
    .middleware({ done })
    .done('done');

  server.listen(4013, function() {});
  http.get('http://localhost:4013', response => {
    server.close();
  });
});

tape('Testing traditional middleware', test => {
  const server = http.createServer();
  const router = require('lr-server-router')(server);
  const done   = (request, response, next) => {
    test.equal(request.url, '/');
    test.end();
    response.end();
    next();
  };
  const noMatch  = (request, response, next) => {
    next();
  };

  let road = core('webserver')
    .extension('router', router, true)
    .middleware({ done, noMatch }, 'done', 'noMatch')
    .noMatch('noMatch')
    .done('done');

  server.listen(4014, function() {});
  http.get('http://localhost:4014', response => {
    server.close();
  });
});

tape('Testing traditional middleware error', test => {
  const server = http.createServer();
  const router = require('lr-server-router')(server);
  const done   = (request, response, next, error) => {
    test.equal(error.message, 'Error');
    test.end();
    response.end();
    next();
  };
  const cause = () => { throw new Error('Error'); }
  let road = core('webserver')
    .extension('router', router, true)
    .middleware({ done, cause }, 'done')
    .run('/', 'cause')
    .done('done');

  server.listen(4015, function() {});
  http.get('http://localhost:4015', response => {
    server.close();
  });
});
