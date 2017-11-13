const check = require('check-types');

module.exports = (executingEnvironment) => {
  check.assert.nonEmptyString(executingEnvironment, 'Environment id should be a non empty string');
  const defaultUpdateType     = 'GET';
  let exposed               = {
    extension,
    callback,
    where,
    fail,
    run,
    parser,
    update,
    selectedParser : { add : () => {}, parse : matchValue => { return { path : matchValue, parameters : {} } } },
    environments   : [executingEnvironment],
    callbacks      : {},
    runners        : [],
  };

  function extension(id, extension) {
    check.assert.nonEmptyString(id, 'Extension id should be a non empty string');
    check.assert.not.assigned(exposed[id], `"${ id }" has already been defined as an extension`);
    exposed[id] = extension;
    return exposed;
  }

  function callback(id, newCallback) {
    check.assert.nonEmptyString(id, 'Callback id should be a non empty string');
    check.assert.function(newCallback, `"${ id }" callback is not a function`);
    exposed.callbacks[id] = {
      environments : exposed.environments,
      callback     : newCallback
    };
    return exposed;
  }

  function where(...newEnvironments) {
    check.assert.greater(newEnvironments.length, 0, 'Please supply at least one environment');
    newEnvironments.forEach(id => {
      check.assert.nonEmptyString(id, 'Environment id should be a non empty string');
    });
    exposed.environments = newEnvironments;
    return exposed;
  }

  function parser(parser) {
    check.assert.function(parser.add, 'Parser needs to have a method called "add"');
    check.assert.function(parser.parse, 'Parser needs to have a method called "parse"');
    exposed.selectedParser = parser;
    return exposed;
  }

  function run(matchValue, callbackId, updateType = defaultUpdateType) {
    check.assert.nonEmptyString(matchValue, 'Match value should be a non empty string');
    check.assert.nonEmptyString(callbackId, 'Callback id should be a non empty string');
    check.assert.nonEmptyString(updateType, 'Update type should be a non empty string');
    exposed.selectedParser.add(matchValue);
    exposed.runners.push({ matchValue, callbackId, updateType });
    return exposed;
  }

  function fail(callbackId) {
    check.assert.nonEmptyString(callbackId, 'Callback id should be a non empty string');
    exposed.fail = callbackId;
    return exposed;
  }

  async function failing(error) {
    if (
      exposed.fail &&
      exposed.callbacks[exposed.fail] &&
      exposed.callbacks[exposed.fail].environments.indexOf(executingEnvironment) > -1) {
      exposed.error = error;
      await exposed.callbacks[exposed.fail].callback(exposed);
    }
  }

  async function update(options, ...parameters) {
    check.assert.assigned(options.matchValue, 'Update function cannot find a matchValue');

    // Get match value
    const mapping      = exposed.selectedParser.parse(options.matchValue);
    const matchValue   = mapping.path;
    exposed.parameters = mapping.parameters;

    // Get update type
    const updateType   = options.updateType ? options.updateType : defaultUpdateType;

    // Only runners in the executing environment
    let matches = [];
    matches = exposed.runners
      .filter(match => {
        return exposed.callbacks[match.callbackId]
          && exposed.callbacks[match.callbackId].environments.indexOf(executingEnvironment) > -1;
      });

    // Filter with the same updateType
    matches = matches.filter(runner => runner.updateType === updateType);

    // Get all the minus matchValues for later
    const excepts = exposed.runners
      .filter(runner => runner.matchValue[0] === '-')
      .filter(runner => runner.matchValue.substring(1) === matchValue)

    // Filter wildard runners and exact match
    matches = matches.filter(runner => runner.matchValue === '*' || runner.matchValue === matchValue);

    // Remove doubles
    matches = matches.reduce((output, runner) => {
      output[runner.callbackId] = runner;
      return output;
    }, {});
    matches = Object.values(matches); // Back to array

    // Remove all the ones that have a minus matchValue and have the same
    // callback id as the minus matchValue
    matches = matches.filter(runner => {
      return excepts.filter(except => except.callbackId === runner.callbackId).length === 0;
    })

    // Add callback to the runners
    matches.map(match => {
      match.callback = exposed.callbacks[match.callbackId].callback;
      return match;
    });

    // No matches
    if (matches.length === 0) {
      await failing(new Error(`No callback found for ${ matchValue }`));
    }

    // Execute the functions
    let local = {};
    try {
      for (let i = 0; i < matches.length; i++) {
        let response = await matches[i].callback(exposed, local, ...parameters);
        if (response === 'exit') {
          break;
        } else if (typeof response === 'object') {
          local = Object.assign({}, local, response);
        }
      }
    } catch (error) {
      console.error(error);
      await failing(error);
    }

    return exposed;
  }

  return exposed;
};
