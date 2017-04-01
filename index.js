const check     = require('check-types');
const flat      = require('flat');
const urlParser = require('lr-url-parser');

module.exports = (environmentId, options = {}) => {
  let runningEnvironment,
      environmentsInUse,
      environments        = {},
      availableMiddleware = {},
      parsers             = [],
      relay               = { extensions : {}, update },
      stack               = [];

  if (Array.isArray(options.parsers)) {
    options.parsers.push(urlParser);
  } else {
    options.parsers = [urlParser];
  }

  options.parsers.forEach(parser => {
    check.assert.function(parser.add, 'Parser needs to have a method called add');
    check.assert.function(parser.parse, 'Parser needs to have a method called parse');
    parsers.push(parser);
  });

  const exposed = {
    extension,
    middleware,
    where,
    match,
    run,
    runCustom,
    once,
    error,
    noMatch,
    done
  };

  const stringPattern = /^[a-z0-9]+$/i;

  environment(environmentId);

  function environment(id) {
    check.assert.not.undefined(id, 'Environment id cannot be empty');
    check.assert.match(id, stringPattern, 'Environment id needs to be a string containing only letters and or numbers');
    environments[id]   = { id, matchesById : {}, matchesByValue : {}, noMatch : [], error : [], done : [] };
    environmentsInUse  = [environments[id]];
    runningEnvironment = id;
    return exposed;
  }

  function extension(id, extension, isUpdater = false) {
    check.assert.not.undefined(id, 'Extension id cannot be empty');
    check.assert.not.undefined(extension, 'Extension cannot be empty');
    check.assert.match(id, stringPattern, 'Extension id needs to be a string containing only letters and or numbers');
    check.assert.not.assigned(relay.extensions[id], `"${ id }" has already been defined as an extension`);
    relay.extensions[id] = isUpdater ? extension(update) : extension;
    return exposed;
  }

  function middleware(newMiddleware) {
    check.assert.not.undefined(newMiddleware, 'Middleware cannot be empty');
    check.assert.nonEmptyObject(newMiddleware, 'Provided middleware needs to be a non empty object');
    newMiddleware = flat(newMiddleware);
    Object.keys(newMiddleware).forEach(id => {
      check.assert.not.assigned(availableMiddleware[id], `"${ id }" has already been defined as middleware`);
    });
    availableMiddleware = Object.assign({}, availableMiddleware, newMiddleware);
    return exposed;
  }

  function where(...environmentIds) {
    check.assert.greater(environmentIds.length, 0, 'Where method missing parameters');
    environmentIds.forEach(id => {
      check.assert.not.undefined(id, 'Environment id cannot be empty');
      check.assert.match(id, stringPattern, 'Environment id needs to be a string containing only letters and or numbers');
      check.assert.assigned(environments[id], `Environment "${ id }" doesn't exist`);
    });
    environmentsInUse = environmentIds.forEach(id => environments[id]);
    return exposed;
  }

  function match(id, ...values) {
    check.assert.not.undefined(id, 'Match id cannot be empty');
    check.assert.greater(values.length, 0, 'Please provide at least one value for your match');
    check.assert.match(id, stringPattern, 'Match id needs to be a string containing only letters and or numbers');
    check.assert.array.of.string(values, 'All match values need to be strings');
    environmentsInUse.forEach(environment => {
      check.assert.not.assigned(environment.matchesById[id], `Match id "${ id }" has already been defined`);
      environment.matchesById[id] = { values : [], middlewareIds : [], once : false, type : 'default' };
      environment.matchesById[id].values = values.reduce((reduced, value) => {
        const group = environment.matchesById[value] ? environment.matchesById[value].values : [value];
        return [...reduced, ...group];
      }, []);

      values = environment.matchesById[id].values;
      values.forEach(value => {
        if (!environment.matchesByValue[value]) {
          environment.matchesByValue[value] = { id : id, middlewareIds : [], once : false, type : 'default' };
          parsers.forEach(parser => parser.add(value));
        }
      });
    });
    return exposed;
  }

  function run(matchId, middlewareId) {
    add(matchId, middlewareId, 'default');
    return exposed;
  }

  function runCustom(matchId, middlewareId, updateType) {
    add(matchId, middlewareId, updateType);
    return exposed;
  }

  function once(matchId, middlewareId) {
    add(matchId, middlewareId, 'default', true);
    return exposed;
  }

  function error(middlewareId) {
    check.assert.not.undefined(middlewareId, 'Middleware id cannot be empty');
    check.assert.match(middlewareId, stringPattern, 'Middleware id needs to be a string containing only letters and or numbers');
    environmentsInUse.forEach(environment => environment.error.push(middlewareId));
    return exposed;
  }

  function noMatch(middlewareId) {
    check.assert.not.undefined(middlewareId, 'Middleware id cannot be empty');
    check.assert.match(middlewareId, stringPattern, 'Middleware id needs to be a string containing only letters and or numbers');
    environmentsInUse.forEach(environment => environment.noMatch.push(middlewareId));
    return exposed;
  }

  function done(middlewareId) {
    check.assert.not.undefined(middlewareId, 'Middleware id cannot be empty');
    check.assert.match(middlewareId, stringPattern, 'Middleware id needs to be a string containing only letters and or numbers');
    environmentsInUse.forEach(environment => environment.done.push(middlewareId));
    return exposed;
  }

  function add(matchId, middlewareId, updateType, once = false) {
    check.assert.not.undefined(matchId, 'Match id cannot be empty');
    check.assert.not.undefined(middlewareId, 'Middleware id cannot be empty');
    check.assert.not.undefined(updateType, 'Update type cannot be empty');
    check.assert.match(matchId, /^[a-z0-9\-\*]+$/i, 'Match id needs to be a string containing only letters, numbers, - or *');
    check.assert.match(middlewareId, stringPattern, 'Middleware id needs to be a string containing only letters and or numbers');
    check.assert.match(updateType, stringPattern, 'Update type needs to be a string containing only letters and or numbers');
    if (matchId.indexOf('*') > -1) {
      check.assert.equal(matchId.length, 1, 'Match id needs to be "*" or a match id, not both');
    }
    if (matchId.indexOf('-') > -1) {
      check.assert.not.equal(matchId.length, 1, 'Match id cannot be "-" only');
    }

    environmentsInUse.forEach(environment => {
      const asArray = Object.keys(environment.matchesById);

      function set(id) {
        environment.matchesById[id].middlewareIds.push(middlewareId);
        environment.matchesById[id].updateType = updateType.toLowerCase();
        environment.matchesById[id].once       = once;
        environment.matchesById[id].values.forEach(value => {
          if (environment.matchesByValue[value].middlewareIds.indexOf(middlewareId) === -1) {
            environment.matchesByValue[value].middlewareIds.push(middlewareId);
          }
        })
      }

      if (matchId === '*') {
        asArray.forEach(set);
      } else if (matchId[0] === '-') {
        matchId = matchId.slice(1);
        check.assert.assigned(environment.matchesById[matchId], `Match id "${ matchId }" not found`);
        asArray
          .filter(key => key !== matchId)
          .forEach(set);
      } else {
        check.assert.assigned(environment.matchesById[matchId], `Match id "${ matchId }" not found`);
        set(matchId);
      }
    });
  }

  function update(options, ...parameters) {
    options.updateType = !options.updateType || options.updateType == 'GET' ? 'default' : options.updateType.toLowerCase();

    check.assert(
      check.any(check.map(options, { matchId : check.assigned, matchValue : check.assigned })),
      'You either need to specify a match id or a match value'
    );

    const environment = environments[runningEnvironment];
    const match       = options.matchId ?
      environment.matchesById[options.matchId] :
      environment.matchesByValue[options.matchValue];

    if (match) {
      stack = [...stack, ...match.middlewareIds];
    } else {
      console.warn(`No match found for ${ options.matchId ? options.matchId : options.matchValue}`);
      stack = [...stack, ...environment.noMatch];
    }

    stack = [...stack, ...environment.done];

    if (environment.done.length < 1) {
      console.warn('There has been no middleware assigned to the done hook');
    }

    function thunkify(middlewareId) {
      if (middlewareId) {
        check.assert.assigned(availableMiddleware[middlewareId], `Middleware ${ middlewareId } not found`);
        check.assert.function(availableMiddleware[middlewareId], 'Middleware needs to be a function');
        return function(defined = {}) {
          check.assert.object(defined, 'Relay additions need to be an object');
          relay = Object.assign({}, relay, defined)
          availableMiddleware[middlewareId](
            (stack.length < 1 ? () => {} : thunkify(stack.shift())),
            relay,
            ...parameters
          );
        }
      } else {
        return () => {};
      }
    }

    try {
      thunkify(stack.shift())(relay);
    } catch (error) {
      if (environment.error.length < 1) {
        console.warn('Error running the middleware stack, but no error hook found');
      }
      relay.error = error;
      stack = [...environment.error, ...environment.done];
      thunkify(stack.shift())(relay);
    }
  }

  return exposed;
};
