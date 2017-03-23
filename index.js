module.exports = () => {

  // The events that trigger updates on the road
  const events  = [
    'dom',
    'data',
    'path'
  ];

  let selected, environments = {}, middlewares = {};

  function getPaths(domain) {
    road[domain]
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

  const exposed = {
    environments(...defined) {
      hasLength(defined).forEach(record => {
        isString(record);
        environments[record] = {
          middleware  : {},
          pathsByName : {},
          pathsByPath : {},
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
      loop(environment => {
        isString(name);
        hasLength(names, 2).forEach(isString);
        shouldNotExist(environment.pathsByName, name);
        environment.pathsByName[name] = names.reduce((reduced, record) => {
          return [...reduced, ...environment.pathsByName[record]];
        }, [])
        environment.pathsByName[name].forEach(path => {
          environment.pathsByPath[path].push(name);
        });
      });
    },
    handle(name, middlware, ...parameters) {
      isString(name);
      isString(middleware);
      shouldExist(middlewares, middleware);
      const inverse = name[0] === '-';
      name          = inverse ? name.slice(1) : name;

      loop(environment => {
        shouldExist(environment.pathsByName, name);
        let names = [name];
        if (inverse) {
          names = Object.clone({}, environment.pathsByName);
          delete names[name];
        }

        Object
          .keys(names)
          .forEach(name => {
            // No path groups
            if (names[name].length < 2) {
              const callback = middlewares(middleware);
              environment.middleware[name] = parameters.length > 0 ? callback(parameters) : callback;
            }
          });
      });
    }
  }

  return exposed;
}
