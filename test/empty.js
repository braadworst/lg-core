const tape = require('tape');
const core = require('../index');

tape('Empty throws: environment', test => {
  test.throws(core, /Environment id cannot be empty/);
  test.end();
});

tape('Empty throws: extension', test => {
  test.throws(() => {
    const road = core('client');
    road.extension();
  }, /Extension id cannot be empty/);
  test.throws(() => {
    const road = core('client');
    road.extension('router');
  }, /Extension cannot be empty/);
  test.end();
});

tape('Empty throws: middleware', test => {
  test.throws(() => {
    const road = core('client');
    road.middleware();
  }, /Middleware cannot be empty/);
  test.end();
});

tape('Empty throws: where', test => {
  test.throws(() => {
    const road = core('client');
    road.where();
  }, /Where method missing parameters/);
  test.end();
});

tape('Empty throws: match', test => {
  test.throws(() => {
    const road = core('client');
    road.match();
  }, /Match id cannot be empty/);
  test.throws(() => {
    const road = core('client');
    road.match('matchId');
  }, /Please provide at least one value for your match/);
  test.end();
});

tape('Empty throws: run', test => {
  test.throws(() => {
    const road = core('client');
    road.run();
  }, /Match id cannot be empty/);
  test.throws(() => {
    const road = core('client');
    road.run('matchId');
  }, /Middleware id cannot be empty/);
  test.end();
});

tape('Empty throws: runCustom', test => {
  test.throws(() => {
    const road = core('client');
    road.runCustom();
  }, /Match id cannot be empty/);
  test.throws(() => {
    const road = core('client');
    road.runCustom('matchId');
  }, /Middleware id cannot be empty/);
  test.throws(() => {
    const road = core('client');
    road.runCustom('matchId', 'middlewareId');
  }, /Update type cannot be empty/);
  test.end();
});

tape('Empty throws: once', test => {
  test.throws(() => {
    const road = core('client');
    road.once();
  }, /Match id cannot be empty/);
  test.throws(() => {
    const road = core('client');
    road.once('matchId');
  }, /Middleware id cannot be empty/);
  test.end();
});

tape('Empty throws: error', test => {
  test.throws(() => {
    const road = core('client');
    road.error();
  }, /Middleware id cannot be empty/);
  test.end();
});

tape('Empty throws: noMatch', test => {
  test.throws(() => {
    const road = core('client');
    road.noMatch();
  }, /Middleware id cannot be empty/);
  test.end();
});

tape('Empty throws: done', test => {
  test.throws(() => {
    const road = core('client');
    road.done();
  }, /Middleware id cannot be empty/);
  test.end();
});
