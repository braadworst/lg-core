module.exports = () => {

  let domains    = [],
      filter     = require('./filter'),
      aliases    = {},
      middleware = {
        before  : {},
        after   : {},
        noMatch : {}
      };

  function filter(functionName, domain, id) {
    let middle = [], before = [], after = [];

    if (middleware.before[domain]) {
      before = middleware.before[domain];
    }

    if (
      middleware[functionName] &&
      middleware[functionName][domain] &&
      middleware[functionName][domain][id]
    ) {
      middle = middleware[functionName][domain][id];
    } else if (middleware.noMatch[domain]) {
      middle = middleware.noMatch[domain];
    } else {
      console.warn(`
        Could not find a route for ${ functionName } - ${ domain } - ${ id }
        and no fallback noMatch defined either
      `);
    }

    if (middleware.after[domain]) {
      after = middleware.after[domain];
    }

    return [...before, ...middle, ...after];
  }

  // Can be called by any extension to initiate an update process
  function update(functionName, domain, id, ...parameters) {
    const stack = filter(functionName, domain, id);
    let relays  = {};

    function thunkify(middleware) {

      if (!middleware) {
        return function last() {};
      }

      return function(data = {}) {
        if (typeof data !== 'object') {
          throw new Error(`Relay data needs to be an object, ${ typeof data } given. Value: ${ data }`);
        }
        relays = Object.assign({}, relay, data);

        if (hook.callback) {
          hook.callback(thunkify(stack.shift()), relay, ...parameters);
        }
      }
    }
    thunkify(stack.shift())();
  }

  function register(extensionName, methodName) {
    // Check if there is an alias
    if (aliases[extensionName] && aliases[extensionName][methodName]) {
      methodName = aliases[extensionName][methodName];
    }
    if (middleware[methodName]) {
      throw new Error(
        `Method ${ methodName } for extension ${ extensionName } has already
        been registed, please provide an alias.
      `);
    }
    exposed[methodName] = (domain, id, callback) => {
      if (!middleware[methodName]) {
        middleware[methodName] = {};
      }
      if (!middleware[methodName][domain]) {
        middleware[methodName][domain] = {};
      }
      if (middleware[methodName][domain][id]) {
        middleware[methodName][domain][id] = [];
      }
      middleware[methodName][domain][id].push(callback);
    }
  }

  let exposed = {
    alias(extensionName, currentName, newName) {
      if (!aliases[extensionName]) {
        aliases[extensionName] = {};
      }
      if (aliases[extensionName][currentName] || middleware[newName]) {
        throw new Error(`Cannot define alias '${ newName }', alias name is already defined`);
      }
      aliases[extensionName][currentName] = newName;
    },
    extension(name, extension) {
      if (typeof extension !== 'function') {
        throw new Error('Extension needs to be of type function');
      }
      extension(update, register);
      return exposed;
    },
    before(domainName, callback, excludes = []) {
      if (!middleware.before[domainName]) {
        middleware.before[domainName] = [];
      }
      middleware.before[domainName].push({
        callback,
        excludes
      });
      return exposed;
    },
    after(domainName, callback, excludes = []) {
      if (!middleware.after[domainName]) {
        middleware.after[domainName] = [];
      }
      middleware.after[domainName].push({
        callback,
        excludes
      });
      return exposed;
    },
    noMatch(domainName, callback, excludes = []) {
      if (!middleware.noMatch[domainName]) {
        middleware.noMatch[domainName] = [];
      }
      middleware.noMatch[domainName].push({
        callback,
        excludes
      });
      return exposed;
    }
  }

  return exposed;
}
