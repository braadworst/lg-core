const check     = require('check-types');
const flat      = require('flat');

module.exports = (environmentId, options = {}) => {
  let runningEnvironment,
      environmentsInUse,
      environments        = {},
      availableMiddleware = {},
      parser              = require('lr-url-parser')(),
      relay               = { extensions : {}, update },
      extensions          = {},
      stack               = [],
      uniqueValues        = [];
      defaultUpdateType   = 'default';
      resetAfterCycle     = true;

  if (options.parser) {
    check.assert.function(options.parser.add, 'Parser needs to have a method called add');
    check.assert.function(options.parser.parse, 'Parser needs to have a method called parse');
    parser = options.parser;
  }

  if (options.resetAfterCycle !== undefined) {
    check.assert.boolean(options.resetAfterCycle, 'resetAfterCycle needs to be a boolean');
    resetAfterCycle = options.resetAfterCycle;
  }

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
    environments[id]   = { id, matches : {}, noMatch : [], error : [], done : [] };
    environmentsInUse  = [environments[id]];
    runningEnvironment = id;
    return exposed;
  }

  function extension(id, extension, isUpdater = false) {
    check.assert.not.undefined(id, 'Extension id cannot be empty');
    check.assert.not.undefined(extension, 'Extension cannot be empty');
    check.assert.match(id, stringPattern, 'Extension id needs to be a string containing only letters and or numbers');
    check.assert.not.assigned(extensions[id], `"${ id }" has already been defined as an extension`);
    extensions[id] = isUpdater ? extension(update) : extension;
    return exposed;
  }

  function middleware(newMiddleware) {
    check.assert.zero(arguments.length - 1, 'Middleware needs exactly one argument');
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
    values.forEach((value, index) => check.assert.equal(values.indexOf(value), index, 'Cannot have duplicates as values'));
    environmentsInUse.forEach(environment => {
      values
        .filter(value => !environment.matches[value])
        .forEach(value => {
          check.assert.not.zero(uniqueValues.indexOf(value), `Match value "${ value }" has already been defined`);
          uniqueValues.push(value);
        });
      check.assert.not.assigned(environment.matches[id], `Match id "${ id }" has already been defined`);
      const merged = values.reduce((reduced, value) => {
        const group = environment.matches[value] ? environment.matches[value].values : [value];
        return [...reduced, ...group];
      }, [])
      merged.forEach((value, index) => check.assert.equal(merged.indexOf(value), index, 'You are grouping values that both contain the same base value'));
      environment.matches[id] = { id, values : merged, middleware : []};
    });

    return exposed;
  }

  function run(matchId, middlewareId) {
    add(matchId, middlewareId, defaultUpdateType);
    return exposed;
  }

  function runCustom(matchId, middlewareId, updateType) {
    add(matchId, middlewareId, updateType);
    return exposed;
  }

  function once(matchId, middlewareId) {
    add(matchId, middlewareId, defaultUpdateType, true);
    return exposed;
  }

  function error(middlewareId) {
    check.assert.zero(arguments.length - 1, 'Error needs exactly one argument');
    check.assert.match(middlewareId, stringPattern, 'Middleware id needs to be a string containing only letters and or numbers');
    environmentsInUse.forEach(environment => environment.error.push({ id : middlewareId }));
    return exposed;
  }

  function noMatch(middlewareId) {
    check.assert.zero(arguments.length - 1, 'NoMatch needs exactly one argument');
    check.assert.match(middlewareId, stringPattern, 'Middleware id needs to be a string containing only letters and or numbers');
    environmentsInUse.forEach(environment => environment.noMatch.push({ id : middlewareId }));
    return exposed;
  }

  function done(middlewareId) {
    check.assert.zero(arguments.length - 1, 'Done needs exactly one argument');
    check.assert.match(middlewareId, stringPattern, 'Middleware id needs to be a string containing only letters and or numbers');
    environmentsInUse.forEach(environment => environment.done.push({ id : middlewareId }));
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
      function set(id) {
        environment.matches[id].middleware.push({ matchId : id, id : middlewareId, updateType, once, hasRanOnce : false });
      }

      let nonGroupMatches = Object
        .keys(environment.matches)
        .filter(key => environment.matches[key].values.length === 1)
        .map(key => environment.matches[key]);

      if (matchId === '*') {
        nonGroupMatches
          .forEach(match => set(match.id));
      } else if (matchId[0] === '-') {
        matchId = matchId.slice(1);
        check.assert.assigned(environment.matches[matchId], `Match id "${ matchId }" not found`);
        nonGroupMatches
          .filter(match => match.key !== matchId)
          .forEach(match => set(match.id));
      } else {
        check.assert.assigned(environment.matches[matchId], `Match id "${ matchId }" not found`);
        const matchValues = environment.matches[matchId].values;
        nonGroupMatches
          .filter(match => matchValues.indexOf(match.values[0]) > -1)
          .forEach(match => set(match.id));
      }
    });
  }

  function update(options, ...parameters) {
    if (resetAfterCycle) {
      relay = { extensions, update };
    }

    options.updateType = !options.updateType || options.updateType == 'GET' ? defaultUpdateType : options.updateType.toLowerCase();

    check.assert(
      check.any(check.map(options, { matchId : check.assigned, matchValue : check.assigned })),
      'You either need to specify a match id or a match value'
    );

    const environment = environments[runningEnvironment];

    let middleware = [];
    if (options.matchValue) {
      middleware = Object
        .keys(environment.matches)
        .map(key => environment.matches[key])
        .filter(match => match.values.indexOf(options.matchValue) > -1)
        .reduce((reduced, current) => [...reduced, ...current.middleware], [])
        .filter(record => record.updateType === options.updateType);
    } else if (environment.matches[options.matchId]) {
      middleware = environment.matches[options.matchId].middleware
        .filter(match => match.updateType === options.updateType);
    }

    if (middleware.length) {
      const matchId = middleware[0].matchId;
      middleware = middleware
        .filter(record => !record.hasRanOnce)
      environment.matches[matchId].middleware = middleware
        .map(record => {
          if (record.once) {
            record.hasRanOnce = true;
          }
          return record;
        });
      stack = [...stack, ...middleware];
    } else {
      stack = [...stack, ...environment.noMatch];
      if (!environment.noMatch.length) {
        console.warn('No matches found and also no "noMatch" middleware present');
      }
    }

    stack = [...stack, ...environment.done];

    if (environment.done.length < 1) {
      console.warn('There has been no middleware assigned to the done hook');
    }

    function thunkify(middleware) {
      if (middleware) {
        check.assert.assigned(availableMiddleware[middleware.id], `Middleware ${ middleware.id } not found`);
        check.assert.function(availableMiddleware[middleware.id], 'Middleware needs to be a function');
        return function(defined = {}) {
          check.assert.object(defined, 'Relay additions need to be an object');
          relay = Object.assign({}, relay, defined)
          availableMiddleware[middleware.id]((stack.length < 1 ? () => {} : thunkify(stack.shift())), relay, ...parameters);
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
