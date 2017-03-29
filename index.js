const check = require('check-types');
const flat  = require('flat');

module.exports = (function() {
  let environmentsInUse,
      environments      = {},
      middleware        = {},
      extensions        = {};

  function update(options, ...parameters) {

    ({ environmentsToUpdate, method, path } = options);

    check.assert.assigned(environmentsToUpdate, 'Please provide environments to update');
    check.assert.assigned(method, 'Please provide a method name');
    check.assert.assigned(path, 'Please provide a path name');
    check.assert.nonEmptyString(method, 'Method needs to be of type string');
    check.assert.nonEmptyString(path, 'Path needs to be of type string');
    check.assert.positive(environmentsToUpdate.length - 1, 'Provide at least one environment name');
    check.assert.array.of.nonEmptyString(environmentsToUpdate, 'All supplied environment names need to be a string');

    options.method = options.method.toLowerCase();
    environmentsToUpdate.forEach(environment => {
      if (environments[environment]) {
        const middleware = environments[environment].middleware;
        const names = options.path[0] === '/' ? environments[environment].pathsByPath[options.path] : [options.path];
        const stack = middleware
          // .filter(record => listeners[options.method].indexOf(record.method) > -1)
          .filter(record => record.names.filter(name => names.indexOf(name) > -1).length > 0);

        let relay = {};
        function thunkify(middleware) {
          if (!middleware) { return function last() {}; }
          if (typeof middleware.callback !== 'function') {
            console.log(middleware);
            throw new Error('Middleware needs to be a function');
          }
          return function(defined) {
            isObject(defined);
            relay = Object.assign({}, relay, defined)
            console.log('calling middleware:', middleware.name);
            middleware.callback(
              thunkify(stack.shift()),
              relay,
              ...parameters
            );
          }
        }

        try {
          thunkify(stack.shift())(extensions);
        } catch (error) {
          console.log('road had an error');
          console.log(error);
        }
      }
    });
  }

  function add(pathId, middlewareId, eventType = 'default', once = false) {
    check.assert.nonEmptyString(pathId, 'Path id needs to be a string');
    check.assert.nonEmptyString(middlewareId, 'Path id needs to be a string');
    check.assert.match(id, /^[a-zA-Z0-9\*\-]*$/, 'Path id contains invalid characaters');
    if (pathId.indexOf('*') > -1) {
      check.assert.equal(pathId.length, 1, 'Path id needs to be * only or a path id not both');
    }

    environmentsInUse.forEach(environment => {
      const asArray = Object.keys(environment.paths);

      function set(id) {
        environment.paths[id].middleware.push(middlewareId);
        environment.paths[id].eventType = eventType;
        environment.paths[id].once      = once;
      }

      if (pathId === '*') {
        asArray.forEach(set);
      } else if (pathId[0] === '-') {
        pathId = pathId.slice(1);
        check.assert.assigned(environment.paths[pathId], `Path ${ pathId } not found`);
        asArray
          .filter(key => key !== pathId)
          .forEach(set);
      } else {
        check.assert.assigned(environment.paths[pathId], `Path ${ pathId } not found`);
        set(pathId);
      }
    });
  }

  function environment(id) {
    check.assert.nonEmptyString(id, 'Provided environment needs to be a string');
    check.assert.not.assigned(environments[id], `${ id } has already be defined as an environment`);
    environments[id] = { paths, noMatch : [], error : [], done : [] };
    return exposed;
  }

  function extension(id, extension, isUpdater = false) {
    check.assert.nonEmptyString(id, 'Provided extension id needs to be a string');
    check.assert.not.assigned(extensions[id], `${ id } has already be defined as an extension`);
    extensions[name] = isUpdater ? extension(update, { environments : environmentsInUse }) : extension;
    return exposed;
  }

  function middleware(newMiddleware) {
    check.assert.nonEmptyObject(newMiddleware, 'Provided middleware needs to be a non empty object');
    newMiddleware = flat(newMiddleware);
    Object.keys(newMiddleware).forEach(id => {
      check.assert.not.assigned(middleware[id], `${ id } has already be defined as middleware`);
    });
    middleware = Object.assign({}, middleware, newMiddleware);
    return exposed;
  }

  function where(...environmentIds) {
    check.assert.positive(environmentIds.length - 1, 'Please provide at least one environment id');
    check.assert.array.of.nonEmptyString(environmentIds, 'All supplied environment ids need to be a string');
    environmentIds.forEach(id => {
      check.assert.assigned(environments[id], `${ id } does not exist as an environment`);
    });
    environmentsInUse = environmentIds.forEach(id => environments[id]);
    return exposed;
  }

  function path(id, ...values) {
    check.assert.match(id, /^[a-zA-Z0-9]*$/, 'Path id needs to be a string containing letters and or numbers');
    check.assert.positive(1 - values.length, 'Please provide at least one value for your path');
    environmentsInUse.forEach(environment => {
      check.assert.not.assigned(environment.paths[id], `${ id } has already been defined`);
      environment.paths[id] = { values : [], middleware : [], once : false, type : 'default' };
      environment.paths[id].values = values.reduce((reduced, value) => {
        const group = environment[value] ? environment[value].values : [value];
        return [...reduced, ...group];
      }, []);
    });
    return exposed;
  }

  function run(pathId, middlewareId) {
    add(pathId, middlewareId);
    return exposed;
  }

  function runCustom(pathId, middlewareId, updateType) {
    add(pathId, middlewareId, updateType);
    return exposed;
  }

  function once(pathId, middlewareId) {
    add(pathId, middlewareId, 'default', true);
    return exposed;
  }

  function error(middlewareId) {
    environmentsInUse.forEach(environment => environment.error.push(middlewareId));
  }

  function noMatch(middlewareId) {
    environmentsInUse.forEach(environment => environment.noMatch.push(middlewareId));
  }

  function done(middlewareId) {
    environmentsInUse.forEach(environment => environment.done.push(middlewareId));
  }

  const exposed = {
    environment,
    extension,
    middleware,
    where,
    path,
    run,
    runCustom,
    once,
    error,
    noMatch
    done
  }

  return exposed;
}());
