const check = require('check-types');

module.exports = () => {
  let selected, environments = {}, middlewares = {}, extensions = {}, listeners = {};

  function update(options, ...parameters) {
    check.assert.assigned(options.environments, 'Please provide environment names');
    check.assert.assigned(options.method, 'Please provide a method name');
    check.assert.assigned(options.path, 'Please provide a path name');
    check.assert.nonEmptyString(options.method, 'Method needs to be of type string');
    check.assert.nonEmptyString(options.path, 'Path needs to be of type string');
    check.assert.hasLength(options.environments, 1, 'Provide at least one environment name');
    check.assert.array.of.nonEmptyString(options.environments, 'All supplied environment names need to be a string');
    if (exposed[options.method]) {
      options.environments.forEach(environment => {
        if (environments[environment]) {
          const middleware = environments[environment].middleware;
          const names = name[0] === '/' ? environments[environment].pathsByPath[options.path] : [options.path];
          const stack = middleware
            .filter(record => listeners[options.method].indexOf(record.method) > -1)
            .filter(record => record.names.filter(name => names.indexOf(name) > -1).length > 0);

          let relay = {};
          function thunkify(middleware) {
            if (!middleware) { return function last() {}; }
            if (typeof middleware.callback !== 'function') {
              throw new Error('Middleware needs to be a function');
            }
            return function(defined) {
              isObject(defined);
              relay = Object.assign({}, relay, defined)
              middleware.callback(
                thunkify(stack.shift()),
                relay,
                ...parameters
              );
            }
          }

          thunkify(stack.shift())(extensions);
        }
      });
    }
  }

  function loop(callback) {
    selected.forEach(environment => {
      callback(environments[environment]);
    });
  }

  const exposed = {
    environment(name) {
      check.assert.not.assigned(environments[name], `${ name } has already be defined as an environment`);
      check.assert.nonEmptyString(name, 'Provided environment needs to be a string');
      environments[name] = {
        middleware  : [],
        pathsByName : {},
        pathsByPath : {},
      }
      return exposed;
    },
    extension(name, extension) {
      check.assert.not.assigned(extensions[name], `${ name } has already be defined as an extension`);
      check.assert.nonEmptyString(name, 'Provided extension name needs to be a string');
      extensions[name] = extension;
      return exposed;
    },
    middleware(defined) {
      check.assert.nonEmptyObject(name, 'Provided middleware needs to be a non empty object');
      Object.keys(defined).forEach(key => {
        check.assert.not.assigned(extensions[name], `${ name } has already be defined as an extension`);
      });
      middlewares = Object.assign({}, middlewares, defined);
    },
    listener(method, ...listeners) {
      check.assert.nonEmptyString(method, 'Provided listener method needs to be a string');
      check.assert.hasLength(listeners, 1, 'Please add at least one listener method');
      check.assert.array.of.nonEmptyString(listeners, 'All listener methods need to be a string');
      check.assert.assigned(exposed[method], `${ method } has not been defined as an event method`);
      listeners.forEach(listener => {
        check.assert.assigned(exposed[listener], `${ listener } has not been defined as an event method`);
      });
      listeners[method] = [...listeners[method], ...listeners];
      return exposed;
    },
    events(extension, ...methods) {
      check.assert.nonEmptyString(extension, 'Provided extension needs to be a string');
      check.assert.hasLength(methods, 1, 'Please add at least one event method name');
      check.assert.array.of.nonEmptyString(methods, 'All event method names need to be a string');
      if (extensions[extension] && typeof extensions[extension] === 'function') {
        extensions[extension](update, { environments : selected });
      }
      methods.forEach(method => {
        check.assert.not.assigned(exposed[method], `${ method } has already been defined as an event method`);
        listeners[method] = [method];
        exposed[method] = (name, middleware, ...parameters) => {
          check.assert.nonEmptyString(name, 'Provided path alias needs to be a string');
          check.assert.nonEmptyString(middleware, 'Provided middleware name needs to be a string');
          check.assert.not.equal(name, '-' `Path alias cannot be "-"`);
          loop(environment => {
            if (middlewares[middleware]) {
              let names;
              if (name[0] === '-') {
                name = name.slice(1);
                check.assert.assigned(environment.pathsByName[name], `${ name } has not been defined as a path alias`);
                names = Object.clone({}, environment.pathsByName);
                delete names[name];
                names = Object.keys(names).filter(key => names[key].length === 1).map(key => names[key]);
              } else {
                check.assert.assigned(environment.pathsByName[name], `${ name } has not been defined as a path alias`);
                names = [name];
              }
              let callback = middlewares[middleware];
              callback = parameters ? callback(parameters) : callback;
              environment.middleware.push({ method, names, callback });
            }
          });
        }
      });
      return exposed;
    },
    where(...defined) {
      check.assert.hasLength(defined, 1, 'Please provide at least one environment name');
      check.assert.array.of.nonEmptyString(defined, 'All supplied environment names need to be a string');
      defined.forEach(environment => {
        check.assert.assigned(environments[environment], `${ environment } has not been defined as a environment name`);
      });
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
        environment.pathsByPath[path] = [name];
        environment.pathsByName[name] = [path];
      });
      return exposed;
    },
    pathGroup(name, ...names) {
      check.assert.nonEmptyString(name, 'Provided path group alias needs to be a string');
      check.assert.hasLength(names, 2, 'Please provide at least two path aliases to create a path group');
      check.assert.array.of.nonEmptyString(names, 'All supplied path aliases need to be a string');
      loop(environment => {
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
    },
  }
  return exposed;
}
