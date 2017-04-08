# lg-core reference

The _lr-core_ package is the only mandatory package for Lagoon road. This package connects everything together, regardless of environment. There are eight exposed functions that you can use.

| Information | - |
| ----------- | - |
| Code coverage | [![Coverage Status](https://coveralls.io/repos/github/lagoon-road/lr-core/badge.svg?branch=master)](https://coveralls.io/github/lagoon-road/lr-core?branch=master) |
| Repo link | [lr-core](https://github.com/lagoon-road/lr-core) |
| Dependencies | [check-types](https://www.npmjs.com/package/check-types) |
| Size (Browserify, Babel, Uglify and Gzip)| 5.3KB |
| Version | 1.0.0 |
| License | MIT |
| Usage | [lagoonroad.com/guide](https://www.lagoonroad.com/guide) |

## core(environmentId:string, [options:object])

```
const core = require('lr-core');
const road = core('webserver');
```
When initiating an new road you have to supply one mandatory argument, the environment id. This will be the environment that is the executing environment.

There is also an optional options object where you can specify some settings, they keys of the object are as follows:

**options.parser:object**  
The parser to use when handling the _matchValue_. Read more about parsers in the [guide](https://lagoonroad.com/guide#parsers).

**options.resetAfterCycle:boolean**  
By default the relay object gets cleared after an update cycle of the road, sometimes, mainly on the client, you want to keep the relay populated even if an update cycle has ran. To do so, you can set this boolean to  _false_

---

## road.extension(id:string, extension:*, isUpdater:boolean = false)

```
road.extension('router', router, true);
```
Use the extension method to add new extensions to the road. You need two mandatory arguments to add an extension. Firstly you have to supply an id that you can use to access the extension in all the middleware. Secondly the actual extension code. This can be anything you like.

The third optional argument is a boolean value to tell the core if on initialization the extension needs to be executed. This is typically for extensions that use update events to trigger updates to the road. Read [more information](https://lagoonroad.com/guide#extensions) about extensions in the guide.

> Extensions can be used in middleware via the relay object.
> ```
> module.exports = (next, relay) => {
>  console.log(relay.extensions.extensionName);
>   next();
> }
>```

---

## road.middleware(newMiddleware:object)

```
road.middleware({ bodyParser }, 'bodyParser');
```

## road.where(environmentId:string, [...environmentId:String])

```
road.where('webserver', 'client');
```

## road.run(matchValue:string, middlewareId:string, [updateType:string])

```
road.run('*', 'log');
```

## road.error(middlewareId:string, [updateType:string])

```
road.error('log')
```

## road.noMatch(middlewareId:string, [updateType:string])

```
road.noMatch('log');
```

## road.done(middlewareId:string, [updateType:string])

```
road.done('response', 'post');
```

## road.update(options:object, [...parameters])

```
road.update({ matchValue : '/somepath', updateType : 'post' })
```
