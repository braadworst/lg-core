const check = require('check-types');

module.exports = (environmentId, options = {}) => {
  const defaultUpdateType     = 'get';
  let middlewareStack         = [];
  let updateStack             = [];
  let relay;
  let selectedParser          = { add : () => {}, parse : matchValue => { return { path : matchValue, parameters : {} } } };
  let resetAfterCycle         = true;
  let traditional             = [];
  let extensions              = {};
  let availableMiddleware     = {};
  let executingEnvironmentId  = environmentId;
  let selectedEnvironmentIds  = [environmentId];
  let environments            = {};
  const exposed               = { extension, middleware, where, run, error, noMatch, done, update, parser };

  if (options.resetAfterCycle !== undefined) {
    check.assert.boolean(options.resetAfterCycle, 'resetAfterCycle needs to be a boolean');
    resetAfterCycle = options.resetAfterCycle;
  }

  environments[environmentId] = environment(environmentId);

  function environment(id) {
    check.assert.not.undefined(id, 'Environment id cannot be empty');
    check.assert.match(id, /^[a-z0-9]+$/i, 'Environment id needs to be a string containing only letters and or numbers');
    return { id, matches : {}, middleware : [], noMatch : [], error : [], done : [] };
  }

  function parser(parser) {
    check.assert.function(parser.add, 'Parser needs to have a method called "add"');
    check.assert.function(parser.parse, 'Parser needs to have a method called "parse"');
    selectedParser = parser;
    return exposed;
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
    selectedParser.add(matchValue);
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
    updateStack.push({ options, parameters });
    if (middlewareStack.length === 0) {
      runMiddlewareStack();
    }
    return exposed;
  }

  function exit() {
    middlewareStack = [];
    runMiddlewareStack();
  }

  function prepareRelay(parameters) {
    if (!relay || resetAfterCycle) {
      relay = Object.assign({ extensions, update, exit }, parameters);
    } else {
      relay = Object.assign({}, relay, parameters);
    }
  }

  function runMiddlewareStack() {
    const update = updateStack.shift();
    if (update) {

      function thunkifyMiddleware(currentMiddleware) {
        if (!currentMiddleware) { return () => {} }
        const id       = currentMiddleware.id;
        const callback = availableMiddleware[id];
        check.assert.assigned(callback, `Middleware ${ id } not found`);
        check.assert.function(callback, 'Middleware needs to be a function');
        return function(defined = {}) {
          check.assert.object(defined, 'Relay additions need to be an object');
          if (defined.extensions) { throw new Error('Cannot assign extensions as a relay property, this is a reserved property') }
          if (defined.exit) { throw new Error('Cannot assign exit as a relay property, this is a reserved property') }
          if (defined.update) { throw new Error('Cannot assign update as a relay property, this is a reserved property') }
          if (defined.parameters) { throw new Error('Cannot assign parameters as a relay property, this is a reserved property') }
          relay          = Object.assign({}, relay, defined);
            const next   = middlewareStack.length === 0 ? () => {} : thunkifyMiddleware(middlewareStack.shift());
          let parameters = [next, relay, ...update.parameters];
          if (traditional.indexOf(id) > -1 && relay.error) {
            parameters = [...update.parameters, next, relay.error];
          } else if (traditional.indexOf(id) > -1) {
            parameters = [...update.parameters, next];
          }
          callback(...parameters);
          if (middlewareStack.length === 0) { runMiddlewareStack(); }
        }
      }

      function getMiddleware(type) {
        let output;
        const environment = environments[executingEnvironmentId];
        if (type === 'match') {
          output = environment.middleware
            .filter(record => record.matchValue === matchValue.path || record.matchValue === '*')
            .filter(record => record.updateType === updateType);
        } else {
          output = environment[type].filter(middleware => middleware.updateType === updateType);
        }
        if (output.length === 0 && (type === 'match' || type === 'error')) {
          console.warn(`No ${ type === 'match' ? '' : '"' + type + '"'} middleware found for matchValue: ${ matchValue.path }, updateType: ${ updateType }`);
        }
        return output;
      }

      check.assert.assigned(update.options.matchValue, 'Update function cannot find a matchValue');
      const matchValue  = selectedParser.parse(update.options.matchValue);
      const updateType  = update.options.updateType ? update.options.updateType.toLowerCase() : defaultUpdateType;
      try {
        prepareRelay({ parameters : matchValue.parameters });
        middlewareStack = getMiddleware('match');
        if (middlewareStack.length === 0) { middlewareStack = getMiddleware('noMatch') }
        middlewareStack = [...middlewareStack, ...getMiddleware('done')];
        thunkifyMiddleware(middlewareStack.shift())();
        return exposed;
      } catch (error) {
        prepareRelay({ error });
        middlewareStack = getMiddleware('error');
        if (middlewareStack.length === 0) { console.error(error); }
        middlewareStack = [...middlewareStack, ...getMiddleware('done')];
        thunkifyMiddleware(middlewareStack.shift())();
      }
    }
  }
  return exposed;
};
