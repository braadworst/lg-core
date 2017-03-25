module.exports = (function() {
  const check = require('check-types');
  const flat  = require('flat');

  let selected, environments = {}, middlewares = {}, extensions = {}, listeners = {};

  function update(options, ...parameters) {
    console.log('updating:', options);
    check.assert.assigned(options.environments, 'Please provide environment names');
    check.assert.assigned(options.method, 'Please provide a method name');
    check.assert.assigned(options.path, 'Please provide a path name');
    check.assert.nonEmptyString(options.method, 'Method needs to be of type string');
    check.assert.nonEmptyString(options.path, 'Path needs to be of type string');
    // check.assert.hasLength(options.environments, 1, 'Provide at least one environment name');
    check.assert.array.of.nonEmptyString(options.environments, 'All supplied environment names need to be a string');
    options.method = options.method.toLowerCase();
    options.environments.forEach(environment => {
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

  function loop(callback) {
    selected.forEach(environment => {
      if (environments[environment]) {
        callback(environments[environment]);
      }
    });
  }

  function general(middleware, method, parameters) {
    check.assert.nonEmptyString(middleware, 'Provided middleware name needs to be a string');
    loop(environment => {
      if (middlewares[middleware]) {
        let callback = middlewares[middleware];
        callback = parameters.length ? callback(parameters) : callback;
        environment.middleware.push({ name : middleware, method, names : environment.pathsByName['*'], callback });
      }
    });
  }

  function specific(name, middleware, parameters, method, once = false) {
    check.assert.nonEmptyString(name, 'Provided path alias needs to be a string');
    check.assert.nonEmptyString(middleware, 'Provided middleware name needs to be a string');
    check.assert.not.equal(name, '-', `Path alias cannot be "-"`);
    loop(environment => {
      if (middlewares[middleware]) {
        let names;
        if (name[0] === '-') {
          name = name.slice(1);
          check.assert.assigned(environment.pathsByName[name], `${ name } has not been defined as a path alias`);
          names = Object.assign({}, environment.pathsByName);
          delete names[name];
          names = Object.keys(names).filter(key => names[key].length === 1).map(key => names[key]);
        } else {
          check.assert.assigned(environment.pathsByName[name], `${ name } has not been defined as a path alias`);
          names = [name];
        }
        let callback = middlewares[middleware];
        callback = parameters.length ? callback(parameters) : callback;
        environment.middleware.push({ method, names, callback, once });
      }
    });
  }

  const exposed = {
    environment(name) {
      check.assert.not.assigned(environments[name], `${ name } has already be defined as an environment`);
      check.assert.nonEmptyString(name, 'Provided environment needs to be a string');
      environments[name] = {
        name,
        middleware  : [],
        pathsByName : {
          '*' : []
        },
        pathsByPath : {},
      }
      return exposed;
    },
    run(name, middleware, ...parameters) {
      specific(name, middleware, parameters, 'get');
      return exposed;
    },
    once(name, middleware, ...parameters) {
      specific(name, middleware, parameters, 'get', true);
      return exposed;
    },
    error(middleware, ...parameters) {
      general(middleware, 'error', parameters);
      return exposed;
    },
    notFound(middleware, ...parameters) {
      general(middleware, 'notFound', parameters);
      return exposed;
    },
    stop(middleware, ...parameters) {
      general(middleware, 'stop', parameters);
      return exposed;
    },
    router(name, extension) {
      console.log('adding router: ', name);
      check.assert.not.assigned(extensions[name], `${ name } has already be defined as an extension`);
      check.assert.nonEmptyString(name, 'Provided extension name needs to be a string');
      extensions[name] = extension(update, { environments : selected });
      return exposed;
    },
    extension(name, extension) {
      check.assert.not.assigned(extensions[name], `${ name } has already be defined as an extension`);
      check.assert.nonEmptyString(name, 'Provided extension name needs to be a string');
      extensions[name] = extension;
      return exposed;
    },
    middleware(middleware) {
      check.assert.nonEmptyObject(middleware, 'Provided middleware needs to be a non empty object');
      middleware = flat(middleware);
      Object.keys(middleware).forEach(key => {
        check.assert.not.assigned(extensions[key], `${ key } has already be defined as an extension`);
      });
      middlewares = Object.assign({}, middlewares, middleware);
    },
    where(...defined) {
      // check.assert.hasLength(defined, 1, 'Please provide at least one environment name');
      check.assert.array.of.nonEmptyString(defined, 'All supplied environment names need to be a string');
      selected = defined;
      return exposed;
    },
    path(name, path) {
      check.assert.nonEmptyString(name, 'Provided path alias needs to be a string');
      check.assert.nonEmptyString(path, 'Provided path needs to be a string');
      check.assert.not.equal(name, '-', 'Path alias cannot be "-"');
      loop(environment => {
        check.assert.not.assigned(environment.pathsByPath[path], `${ path } has already been defined`);
        check.assert.not.assigned(environment.pathsByName[name], `${ name } has already been defined`);
        console.log('Adding path: ', environment.name, name, path);
        environment.pathsByPath[path] = [name];
        environment.pathsByName[name] = [path];
        environment.pathsByName['*'].push(path);
      });
      return exposed;
    },
    pathGroup(name, ...names) {
      check.assert.nonEmptyString(name, 'Provided path group alias needs to be a string');
      // check.assert.hasLength(names, 2, 'Please provide at least two path aliases to create a path group');
      check.assert.array.of.nonEmptyString(names, 'All supplied path aliases need to be a string');
      loop(environment => {
        console.log('Adding path group: ', environment.name, name, names.toString());
        check.assert.not.assigned(environment.pathsByName[name], `${ name } has already been defined`);
        names.forEach(record => {
          check.assert.assigned(environment.pathsByName[record], `${ record } has not been defined as path alias or path group`);
        });
        environment.pathsByName[name] = names.reduce((reduced, record) => {
          return [...reduced, ...environment.pathsByName[record]];
        }, []);
        environment.pathsByName[name].forEach(path => {
          environment.pathsByPath[path].push(name);
        });
      });
      return exposed;
    },
    // listener(method, ...listeners) {
    //   check.assert.nonEmptyString(method, 'Provided listener method needs to be a string');
    //   check.assert.hasLength(listeners, 1, 'Please add at least one listener method');
    //   check.assert.array.of.nonEmptyString(listeners, 'All listener methods need to be a string');
    //   check.assert.assigned(exposed[method], `${ method } has not been defined as an event method`);
    //   listeners.forEach(listener => {
    //     check.assert.assigned(exposed[listener], `${ listener } has not been defined as an event method`);
    //   });
    //   listeners[method] = [...listeners[method], ...listeners];
    //   return exposed;
    // },
    // events(extension, ...methods) {
    //   check.assert.nonEmptyString(extension, 'Provided extension needs to be a string');
    //   check.assert.hasLength(methods, 1, 'Please add at least one event method name');
    //   check.assert.array.of.nonEmptyString(methods, 'All event method names need to be a string');
    //   if (extensions[extension] && typeof extensions[extension] === 'function') {
    //     extensions[extension](update, { environments : selected });
    //   }
    //   methods.forEach(method => {
    //     check.assert.not.assigned(exposed[method], `${ method } has already been defined as an event method`);
    //     listeners[method] = [method];
    //     exposed[method] = (name, middleware, ...parameters) => {
    //       specific(name, middleware, parameters);
    //     }
    //   });
    //   return exposed;
    // },
  }
  return exposed;
}());
