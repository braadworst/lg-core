const tape   = require('tape');
const core   = require('../index');

tape('Adding unknown environment', test => {
  const done = (next, relay) => {
    test.equal(true, true);
    test.end();
    next();
  };

  core('webserver')
    .middleware({ done })
    .where('client')
    .where('webserver')
    .done('done')
    .update({ matchValue: '/' });
});

tape('Middleware matching: wildcard', test => {
  const done = (next, relay) => {
    test.equal(relay.wildcard, true);
    test.end();
    next();
  };
  const wildcard = (next, relay) => {
    next({ wildcard : true });
  };

  core('webserver')
    .middleware({ done, wildcard })
    .run('*', 'wildcard')
    .done('done')
    .update({ matchValue : '/' });
});

tape('Middleware matching: noMatch', test => {
  const done = (next, relay) => {
    test.equal(relay.noMatch, true);
    test.end();
    next();
  };
  const noMatch = (next, relay) => {
    next({ noMatch : true });
  };
  core('webserver')
    .middleware({ done, noMatch })
    .noMatch('noMatch')
    .done('done')
    .update({ matchValue : '/' });
});

tape('Middleware matching: error', test => {
  const done = (next, relay) => {
    test.equal(relay.error, true);
    test.end();
    next();
  };
  const error = (next, relay) => {
    next({ error : true });
  };
  const cause = (next, relay) => {
    throw new Error('Failing');
  };

  core('webserver')
    .middleware({ done, error, cause })
    .run('/', 'cause')
    .error('error')
    .done('done')
    .update({ matchValue : '/' })
});

tape('Middleware matching: Async error', test => {
  const done = (next, relay) => {
    test.equal(relay.error, true);
    test.end();
    next();
  };
  const error = (next, relay) => {
    next({ error : true });
  };
  const cause = async function(next, relay) {
    throw new Error('Failing');
  };

  core('webserver')
    .middleware({ done, error, cause })
    .run('/', 'cause')
    .error('error')
    .done('done')
    .update({ matchValue : '/' })
});

tape('Middleware matching: next not object', test => {
  const done = (next, relay) => {
    test.equal(relay.error, true);
    test.end();
    next();
  };
  const notObject = (next, relay) => {
    next(true);
  };
  const error = (next, relay) => {
    next({ error : true });
  };

  core('webserver')
    .middleware({ done, error, notObject })
    .run('/', 'notObject')
    .error('error')
    .done('done')
    .update({ matchValue : '/' });
});

tape('Middleware matching: error no hook', test => {
  const done = (next, relay) => {
    test.equal(typeof relay.error, 'object');
    test.end();
    next();
  };
  const cause = (next, relay) => {
    throw new Error('Failing');
  };

  core('webserver')
    .middleware({ done, cause })
    .run('/', 'cause')
    .done('done')
    .update({ matchValue : '/' })
});

tape('Early exit', test => {
  const early = (next, relay) => {
    test.equal(relay.exit(), undefined);
    test.end();
    next();
  };

  let road = core('webserver')
    .middleware({ early })
    .run('/', 'early')
    .update({ matchValue : '/' })
});

tape('Update without middleware', test => {
  test.doesNotThrow(() => {
    core('webserver')
      .update({ matchValue : '/' });
  }, undefined);
  test.end();
});

tape('Reserved relay property extension error', test => {
  core('client')
    .middleware({
      reserved : next => { next({ extensions : true }) },
      error : (next, relay) => {
        test.equal(relay.error.message, 'Cannot assign extensions as a relay property, this is a reserved property')
        test.end();
        next();
      }
    })
    .run('/', 'reserved')
    .run('/', 'reserved')
    .error('error')
    .update({ matchValue : '/' });
});

tape('Reserved relay property exit error', test => {
  core('client')
    .middleware({
      reserved : next => { next({ exit : true }) },
      error : (next, relay) => {
        test.equal(relay.error.message, 'Cannot assign exit as a relay property, this is a reserved property')
        test.end();
        next();
      }
    })
    .run('/', 'reserved')
    .run('/', 'reserved')
    .error('error')
    .update({ matchValue : '/' });
});

tape('Reserved relay property update error', test => {
  core('client')
    .middleware({
      reserved : next => { next({ update : true }) },
      error : (next, relay) => {
        test.equal(relay.error.message, 'Cannot assign update as a relay property, this is a reserved property')
        test.end();
        next();
      }
    })
    .run('/', 'reserved')
    .run('/', 'reserved')
    .error('error')
    .update({ matchValue : '/' });
});

tape('Reserved relay property parameters error', test => {
  core('client')
    .middleware({
      reserved : next => { next({ parameters : true }) },
      error : (next, relay) => {
        test.equal(relay.error.message, 'Cannot assign parameters as a relay property, this is a reserved property')
        test.end();
        next();
      }
    })
    .run('/', 'reserved')
    .run('/', 'reserved')
    .error('error')
    .update({ matchValue : '/' });
});

tape('Carry over relay', test => {
  const done = (next, relay) => {
    test.equal(relay.one, true);
    test.equal(relay.two, true);
    test.end();
    next();
  };

  const two = next => next({ one : true });
  const one = next => next({ two : true });

  core('webserver', { resetAfterCycle : false})
    .middleware({ done, one, two })
    .run('/one', 'one')
    .run('/two', 'two')
    .run('/two', 'done')
    .update({ matchValue : '/one' })
    .update({ matchValue : '/two' })
});

tape('Next after done', test => {
  const done = (next, relay) => {
    test.equal(typeof next, 'function');
    test.end();
    next();
  };

  core('webserver')
    .middleware({ done })
    .done('done')
    .update({ matchValue : '/' });
});

tape('Multiple error hooks', test => {
  const done = (next, relay) => {
    test.equal(relay.error, true);
    test.end();
    next();
  };

  const error = next => { next({ error : true }) };
  const cause = next => { throw new Error('Ouch'); }

  core('webserver')
    .middleware({ done, error, cause })
    .run('/', 'cause')
    .error('error')
    .error('error')
    .done('done')
    .update({ matchValue : '/' })
});

tape('Multiple done hooks', test => {
  const done = (next, relay) => {
    test.equal(relay.error, true);
    test.end();
    next();
  };

  const error = next => { next({ error : true }) };

  core('webserver')
    .middleware({ done, error})
    .done('error')
    .done('done')
    .update({ matchValue : '/' })
});

tape('Multiple noMatch hooks', test => {
  const done = (next, relay) => {
    test.equal(relay.one, true);
    test.equal(relay.two, true);
    test.end();
    next();
  };

  const two = next => next({ one : true });
  const one = next => next({ two : true });

  core('webserver')
    .middleware({ done, one, two })
    .noMatch('one')
    .noMatch('two')
    .done('done')
    .update({ matchValue : '/' })
});

tape('Error but no hooks edge case', test => {
  const cause = next => {
    test.equal(true, true);
    test.end();
    throw new Error('Ouch');
  }

  core('webserver')
    .middleware({ cause })
    .run('/', 'cause')
    .update({ matchValue : '/' })
});

tape('Error in the error handling', test => {
  const cause = next => {
    throw new Error('Ouch');
  }
  const error = next => {
    test.equal(true, true);
    test.end();
    throw new Error('Ouch');
  }
  core('webserver')
    .middleware({ cause, error })
    .run('/', 'cause')
    .error('error')
    .update({ matchValue : '/' })
});
