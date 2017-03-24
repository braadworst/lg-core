module.exports = () => {
  let selected, environments = {}, middlewares = {}, extensions = {}, listeners = {};

  function update(options, ...parameters) {
    shouldExist(options, 'environments');
    shouldExist(options, 'method');
    shouldExist(exposed, options.method);
    shouldExist(options, 'path');
    isString(options.method);
    isString(options.path);
    selectedEnvironments.forEach(isString);
    options.environments.forEach(environment => shouldExist(environments, environment));
    options.environments.forEach(environment => {
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
    });
  }

  function loop(callback) {
    selected.forEach(environment => {
      callback(environments[environment]);
    });
  }

  function isString(value) {
    if (typeof value !== 'string') {
      throw new Error(`Supplied argument needs to be a string, got type ${ typeof value }, ${ value }`);
    }
    if (value.length === 0) {
      throw new Error('Supplied argument is an empty string');
    }
    return value;
  }

  function hasLength(array, length = 1) {
    if (array.length < length) {
      throw new Error('Please supply all needed arguments');
    }
    return array;
  }

  function shouldExist(object, key) {
    if (!object[key]) {
      throw new Error(`${ key } has not been defined`);
    }
  }

  function shouldNotExist(object, key) {
    if (object[key]) {
      throw new Error(`${ key } has already been defined`);
    }
  }

  function isObject(value) {
    if (typeof value !== 'object') {
      throw new Error('Supplied value should be of type object');
    }
  }

  const exposed = {
    environment(name) {
      shouldNotExist(environments, name);
      isString(name);
      environments[name] = {
        middleware  : [],
        pathsByName : {},
        pathsByPath : {},
      }
      return exposed;
    },
    extension(name, extension) {
      isString(name);
      extensions[name] = extension;
      return exposed;
    },
    middleware(defined = {}) {
      isObject(defined);
      Object.keys(defined).forEach(key => shouldNotExist(middlewares, key));
      middlewares = Object.assign({}, middlewares, defined);
    },
    listener(method, ...listeners) {
      isString(method);
      hasLength(listeners).forEach(isString).forEach(method => shouldExist(exposed, method));
      shouldExist(listeners, method);
      listeners[method] = [...listeners[method], ...listeners];
      return exposed;
    },
    events(extension, ...methods) {
      isString(extension);
      hasLength(methods).forEach(isString);
      if (extensions[extension] && typeof extensions[extension] === 'function') {
        extensions[extension](update, { environments : selected });
      }
      methods.forEach(method => {
        shouldNotExist(exposed, method);
        listeners[method] = [method];
        exposed[method] = (name, middleware, ...parameters) => {
          let names;
          if (name[0] === '-') {
            name = name.slice(1);
            shouldExist(environment.pathsByName, name);
            names = Object.clone({}, environment.pathsByName);
            delete names[name];
            names = Object.keys(names).filter(key => names[key].length === 1).map(key => names[key]);
          } else {
            shouldExist(environment.pathsByName, name);
            names = [name];
          }

          loop(environment => {
            if (middlewares[middleware]) {
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
      hasLength(defined).forEach(isString);
      selected = defined;
      return exposed;
    },
    path(name, path) {
      isString(name);
      isString(path);
      loop(environment => {
        shouldNotExist(environment.pathsByPath, path);
        shouldNotExist(environment.pathsByName, name);
        environment.pathsByPath[path] = [name];
        environment.pathsByName[name] = [path];
      });
      return exposed;
    },
    pathGroup(name, ...names) {
      isString(name);
      hasLength(names, 2).forEach(isString);
      loop(environment => {
        shouldNotExist(environment.pathsByName, name);
        environment.pathsByName[name] = names.reduce((reduced, record) => {
          return [...reduced, ...environment.pathsByName[record]];
        }, [])
        environment.pathsByName[name].forEach(path => {
          shouldExist(environment.pathsByPath, path);
          environment.pathsByPath[path].push(name);
        });
      });
    },
  }

  return exposed;
}
