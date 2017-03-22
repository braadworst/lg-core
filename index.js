module.exports = () => {

  let extensions = {},
      middlewares = {
        before  : [],
        after   : [],
        noMatch : []
      };

  function filter(method, path) {
    if (middleware[method] && middleware[method][path]) {
      return [...middleware.before, ...middleware[method][path], ...midleware.after];
    } else if (middleware.noMatch.length > 0) {
      return [...middleware.before, ...middleware.noMatch, ...midleware.after];
    } else {
      console.warn(`Could not find a route for ${ method } - ${ path } and no fallback noMatch defined either`);
    }
  }

  function getAlias(extension, method) {
    if (aliases[extension] && aliases[extension][method]) {
      return aliases[extension][method];
    }
    return method;
  }

  function update(extension, method, path) {
    const stack = filter(getAlias(extension, method), path);
    let relay   = extensions;

    function thunkify(hook) {
      if (!hook) {
        return function last() {};
      }

      return function(data = {}) {
        if (typeof data !== 'object') {
          throw new Error(`Relay data needs to be an object, ${ typeof data } given. Value: ${ data }`);
        }
        relay = Object.assign({}, relay, data);

        if (hook.callback) {
          hook.callback(thunkify(stack.shift()), relay, ...parameters);
        }
      }
    }
    thunkify(stack.shift())();
  }

  function expose(extension, methods) => {
    methods = methods
      .map(method => getAlias(extension, method))
      .forEach(method => {
        if (exposed[method]) {
          throw new Error(`${ extension } tries to add method ${ method } which already exists, please add an alias`);
        }
        middleware[method] = {};
        exposed[method] = (path = '*', callback) => {
          if (middleware[method][path]) {
            middleware[method][path] = [];
          }
          middleware[method][path].push(callback);
        }
      });
  }

  let exposed = {
    alias(extensionName, methodName, newMethodName) {
      if (aliases[extensionName] && aliases[extensionName][methodName]) {
        throw new Error(`
          There is already an alias defined for extension ${ extensionName }
          with the method ${ methodName }
        `);
      } else if (!aliases[extensionName]) {
        aliases[extensionName] = {};
      }
      aliases[extensionName][methodName] = newMethodName;
    },
    extension(name, extension) {
      if (typeof name !== 'string') {
        throw new Error('Name needs to be a string');
      }
      if (typeof extension !== 'function') {
        throw new Error('Extension needs to be of type function');
      }
      extensions[name] = extension(expose, update);
      return exposed;
    },
    before(callback, ...excludes) {
      middleware.before.push({ callback, excludes });
      return exposed;
    },
    after(callback, ...excludes) {
      middleware.after.push({ callback, excludes });
      return exposed;
    },
    noMatch(callback, ...excludes) {
      middleware.noMatch.push({ callback, excludes });
      return exposed;
    }
  }

  return exposed;
}
