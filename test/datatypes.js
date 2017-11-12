const tape      = require('tape');
const core      = require('../index');
const datatypes = [{}, [], true, 1, undefined];

tape('Datatypes invalid throws: environment', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => { core(datatype) }, /Environment id should be a non empty string/);
    });
  test.end();
});

tape('Datatypes invalid throws: extension', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.extension(datatype, 'extension');
      }, /Extension id should be a non empty string/);
    });
  test.end();
});

tape('Datatypes invalid throws: callback', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.callback(datatype);
      }, /Callback id should be a non empty string/);
    });
  test.end();
});

tape('Datatypes invalid throws: where', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.where(datatype);
      }, /Environment id should be a non empty string/);
    });
  test.end();
});

tape('Datatypes invalid throws: run', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.run(datatype, 'callbackId');
      }, /Match value should be a non empty string/);
    });
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.run('matchValue', datatype);
      }, /Callback id should be a non empty string/);
    });
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.run('matchValue', 'datatype', () => {});
      }, /Update type should be a non empty string/);
    });
  test.end();
});

tape('Datatypes invalid throws: fail', test => {
  datatypes
    .forEach(datatype => {
      test.throws(() => {
        const road = core('client');
        road.fail(datatype);
      }, /Callback id should be a non empty string/);
    });
  test.end();
});
