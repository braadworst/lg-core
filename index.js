const check = require('check-types');

module.exports = (environmentId, options = {}) => {
  const defaultUpdateType     = 'get';
  let resetAfterCycle         = true;
  let traditional             = [];
  let stack                   = [];
  let extensions              = {};
  let relay;
  let parser                  = require('lr-url-parser')();
  let availableMiddleware     = {};
  let executingEnvironmentId  = environmentId;
  let selectedEnvironmentIds  = [environmentId];
  let environments            = {};
  const exposed               = { extension, middleware, where, run, error, noMatch, done, update };

  if (options.parser) {
    check.assert.function(options.parser.add, 'Parser needs to have a method called "add"');
    check.assert.function(options.parser.parse, 'Parser needs to have a method called "parse"');
    parser = options.parser;
  }

  if (options.resetAfterCycle !== undefined) {
    check.assert.boolean(options.resetAfterCycle, 'resetAfterCycle needs to be a boolean');
    resetAfterCycle = options.resetAfterCycle;
  }

  environments[environmentId] = environment(environmentId);
  relay = setRelay();

  function setRelay() {
    if (resetAfterCycle) {
      return { extensions };
    } else if (!relay) {
      return { extensions : {} };
    } else {
      return relay;
    }
  }

  function environment(id) {
    check.assert.not.undefined(id, 'Environment id cannot be empty');
    check.assert.match(id, /^[a-z0-9]+$/i, 'Environment id needs to be a string containing only letters and or numbers');
    return { id, matches : {}, middleware : [], noMatch : [], error : [], done : [] };
  }

  function extension(id, extension, isUpdater = false) {
    check.assert.not.undefined(id, 'Extension id cannot be empty');
    check.assert.not.undefined(extension, 'Extension cannot be empty');
    check.assert.match(id, /^[a-z0-9]+$/i, 'Extension id needs to be a string containing only letters and or numbers');
    check.assert.not.assigned(extensions[id], `"${ id }" has already been defined as an extension`);
    extensions[id] = isUpdater ? extension(update) : extension;
    return exposed;
  }

  function middleware(newMiddleware, ...traditionals) {
    check.assert.nonEmptyObject(newMiddleware, 'Provided middleware needs to be a non empty object');
    Object.keys(newMiddleware).forEach(id => {
      check.assert.not.assigned(availableMiddleware[id], `"${ id }" has already been defined as middleware`);
      check.assert.function(newMiddleware[id], `"${ id }" middleware is not a function`);
    });
    if (traditionals.length) {
      check.assert.array.of.string(traditionals, 'All traditional middleware names need to be strings');
      traditionals
        .forEach((id, index) => {
          check.assert.equal(traditionals.indexOf(id), index, `Duplicate values found for traditional middleware "${ id }"`);
          check.assert.equal(traditional.indexOf(id), -1, `"${ id }" has already been defined as a traditional middleware function`);
        });
      traditional = [...traditional, ...traditionals];
    }
    availableMiddleware = Object.assign({}, availableMiddleware, newMiddleware);
    return exposed;
  }

  function where(...environmentIds) {
    check.assert.greater(environmentIds.length, 0, 'Where method missing parameters');
    environmentIds.forEach(id => {
      check.assert.not.undefined(id, 'Environment id cannot be empty');
      check.assert.match(id, /^[a-z0-9]+$/i, 'Environment id needs to be a string containing only letters and or numbers');
      if (!environments[id]) {
        environments[id] = environment(id);
      }
    });
    selectedEnvironmentIds = environmentIds;
    return exposed;
  }

  function run(matchValue, middlewareId, updateType = defaultUpdateType) {
    check.assert.not.undefined(matchValue, 'Match value cannot be empty');
    check.assert.string(matchValue, 'Match value needs to be a string');
    check.assert.not.undefined(middlewareId, 'Middleware id cannot be empty');
    check.assert.match(middlewareId, /^[a-z0-9\.]+$/i, 'Middleware id needs to be a string containing only letters,numbers and an optional "."');
    check.assert.match(updateType, /^[a-z0-9]+$/i, 'Update type needs to be a string containing only letters and or numbers');
    selectedEnvironmentIds.forEach(environmentId => {
      environments[environmentId].middleware.push({ matchValue, id : middlewareId, updateType : updateType.toLowerCase() });
    });
    return exposed;
  }

  function error(middlewareId, updateType = defaultUpdateType) {
    check.assert.zero(arguments.length - 1, 'Error needs exactly one argument');
    check.assert.match(middlewareId, /^[a-z0-9\.]+$/i, 'Middleware id needs to be a string containing only letters,numbers and an optional "."');
    selectedEnvironmentIds.forEach(id => environments[id].error.push({ id : middlewareId, updateType }));
    return exposed;
  }

  function noMatch(middlewareId, updateType = defaultUpdateType) {
    check.assert.zero(arguments.length - 1, 'NoMatch needs exactly one argument');
    check.assert.match(middlewareId, /^[a-z0-9\.]+$/i, 'Middleware id needs to be a string containing only letters,numbers and an optional "."');
    selectedEnvironmentIds.forEach(id => environments[id].noMatch.push({ id : middlewareId, updateType }));
    return exposed;
  }

  function done(middlewareId, updateType = defaultUpdateType) {
    check.assert.zero(arguments.length - 1, 'Done needs exactly one argument');
    check.assert.match(middlewareId, /^[a-z0-9\.]+$/i, 'Middleware id needs to be a string containing only letters,numbers and an optional "."');
    selectedEnvironmentIds.forEach(id => environments[id].done.push({ id : middlewareId, updateType }));
    return exposed;
  }

  function update(options, ...parameters) {
    check.assert.assigned(options.matchValue, 'Update function cannot find a matchValue');
    const matchValue      = parser.parse(options.matchValue);
    const updateType      = options.updateType ? options.updateType.toLowerCase() : defaultUpdateType;
    relay                 = setRelay();
    relay.parameters      = matchValue.parameters;
    const environment     = environments[executingEnvironmentId];
    let middleware        = environment.middleware
      .filter(record => record.matchValue === matchValue.path || record.matchValue === '*')
      .filter(record => record.updateType === updateType);
    stack = [...stack, ...middleware];

    function addNoMatchMiddleware() {
      stack = [...stack, ...environment.noMatch.filter(middleware => middleware.updateType === updateType)];
    }

    function addDoneMiddleware() {
      stack = [...stack, ...environment.done.filter(middleware => middleware.updateType === updateType)];
    }

    function addErrorMiddleware() {
      stack = [...stack, ...environment.error.filter(middleware => middleware.updateType === updateType)];
    }

    if (middleware.length === 0) { addNoMatchMiddleware(); }
    addDoneMiddleware();

    function thunkify(record) {
      const id       = record.id;
      const callback = availableMiddleware[id];
      check.assert.assigned(callback, `Middleware ${ id } not found`);
      check.assert.function(callback, 'Middleware needs to be a function');
      return function(defined = {}) {
        check.assert.object(defined, 'Relay additions need to be an object');
        relay = Object.assign({}, relay, defined);
        const next = (stack.length === 0) ? () => {} : thunkify(stack.shift());
        if (traditional.indexOf(id) > -1) {
          callback(...parameters, next);
        } else {
          callback(next, relay, ...parameters);
        }
      }
    }

    try {
      if (stack.length > 0) {
        thunkify(stack.shift())(relay);
      } else {
        console.warn(`No middleware found for current update cycle matchValue: ${ matchValue.path }, updateType: ${ updateType }`);
      }
    } catch (error) {
      stack = [];
      addErrorMiddleware();
      addDoneMiddleware();
      relay.error = error;
      if (stack.length > 0) {
        thunkify(stack.shift())(relay);
      } else {
        console.error(`Error but no middleware found, path: ${ matchValue.path }, updateType: ${ updateType }`);
        console.error(error);
      }
    }
  }
  return exposed;
};
