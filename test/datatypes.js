const tape      = require('tape');
const core      = require('../index');
const datatypes = [{}, [], true, 1];

tape('Datatypes invalid throws: environment', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => { core(datatype) }, /Environment id needs to be a string containing only letters and or numbers/);
    });
  test.end();
});

tape('Datatypes invalid throws: extension', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.extension(datatype, 'extension');
      }, /Extension id needs to be a string containing only letters and or numbers/);
    });
  test.end();
});

tape('Datatypes invalid throws: middleware', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.middleware(datatype);
      }, /Provided middleware needs to be a non empty object/);
    });
  test.end();
});

tape('Datatypes invalid throws: where', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.where(datatype);
      }, /Environment id needs to be a string containing only letters and or numbers/);
    });
  test.end();
});

tape('Datatypes invalid throws: run', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.run(datatype, 'middlewareId');
      }, /Match value needs to be a string/);
    });
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.run('matchValue', datatype);
      }, /Middleware id needs to be a string containing only letters,numbers and an optional "."/);
    });
  test.end();
});

tape('Datatypes invalid throws: error', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.error(datatype);
      }, /Middleware id needs to be a string containing only letters,numbers and an optional "."/);
    });
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.error('middlewareId', datatype);
      }, /Update type needs to be a string containing only letters and or numbers/);
    });
  test.end();
});

tape('Datatypes invalid throws: noMatch', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.noMatch(datatype);
      }, /Middleware id needs to be a string containing only letters,numbers and an optional "."/);
    });
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.noMatch('middlewareId', datatype);
      }, /Update type needs to be a string containing only letters and or numbers/);
    });
  test.end();
});

tape('Datatypes invalid throws: done', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.done(datatype);
      }, /Middleware id needs to be a string containing only letters,numbers and an optional "."/);
    });
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.done('middlewareId', datatype);
      }, /Update type needs to be a string containing only letters and or numbers/);
    });
  test.end();
});
