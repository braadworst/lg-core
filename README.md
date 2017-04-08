# lg-core reference

The _lr-core_ package is the only mandatory package for Lagoon road. This package connects everything together, regardless of environment. There are eight exposed functions that you can use.

| Information | - |
| ----------- | - |
| Code coverage | [![Coverage Status](https://coveralls.io/repos/github/lagoon-road/lr-core/badge.svg?branch=master)](https://coveralls.io/github/lagoon-road/lr-core?branch=master) |
| Repo link | [lr-core](https://github.com/lagoon-road/lr-core) |
| Dependencies | [check-types](https://github.com/philbooth/check-types.js), [lr-url-parser](https://github.com/lagoon-road/lr-url-parser) |
| Size (Browserify, Babel, Uglify and Gzip)| 5.3KB |
| Version | 1.0.0 |
| License | MIT |
| Usage | [lagoonroad.com/guide](https://www.lagoonroad.com/guide) |

---

### core(environmentId, [options])
```
const core = require('lr-core');
const road = core('webserver');
```
**environmentId:string**  
The primary environment id for the road, this is the executing environment that will be used when an update cycle is fired.

**[options.parser:object]**  
The parser to use when handling the _matchValue_. Read more about parsers in the [guide](https://lagoonroad.com/guide#parsers).

**[options.resetAfterCycle:boolean]**  
By default the relay object gets cleared after an update cycle of the road, sometimes, mainly on the client, you want to keep the relay populated even if an update cycle has ran. To do so, you can set this boolean to  _false_

---

### road.extension(extensionId, extension, [isUpdater])
```
road.extension('router', router, true);
```
**extensionId:string**  
A unique id to identify the extension.

**extension:\***  
The actual extension, this can be any type of code that you want to use

**[isUpdater:boolean = false]**  
Tell the core if on initialization the extension needs to be executed. This is typically for extensions that use update events to trigger updates to the road. Read more about [extensions](https://lagoonroad.com/guide#extensions) in the guide.

> Extensions can be used in middleware via the relay object.
> ```
> module.exports = (next, relay) => {
>   console.log(relay.extensions.extensionName);
>   next();
> }
>```

---

### road.middleware(middleware)
```
road.middleware({ bodyParser }, 'bodyParser');
```
**middleware:object**  
An object with all the middleware you want to use. This is a single depth object so don't use any nested structures.

> Middleware methods can be called multiple times, the middleware will all be added to a single object within the core. Therefore you need to supply unique ids/keys.
> If you have a multitude of middleware functions that you  want to use it might be handy to use a dot notation to  group your middleware.
> ```
> road.middleware({
>   'templating.component.navigation' : require('...'),  
>   'templating.component.home'       : require('...'),  
> });
> ```
> Read more about how to define and use middleware in the [guide](https://lagoonroad.com/guide#middleware).

---

### road.where(environmentId, [...environmentId])

```
road.where('webserver', 'client');
```
_When assigning middleware to the road you might want to switch the environment they need to be assigned to. You can do that by using the `where` method._

**environmentId**  
The where method expects at least one argument, which should be a string. This is an environment id to which all the following middleware will be assigned. If you want to assign middleware to multiple environments you can just specify several ids like in the example above.

---

### road.run(matchValue, middlewareId, [matchValue])

```
road.run('*', 'log');
```

**matchValue:string**  
A match value in most webapps can be thought of as an url path, but it is not limited to paths only. Frankly it can be any string you can think of, even a JSON string to match on JSON content. Or in an even more exotic example you can match Raspberry pie sensor outputs via an extension to string values and let that trigger middleware. You can use the `*` as a wildcard to match on all match values that might come in.

**middlewareId:string**  
Identifier you added by using the `middleware` method. It needs to be a string and should match to a middleware function, otherwise it will throw.

**[updateType:string]**  
The update type is an extra layer for matching middleware, if we use a http protocol to update the road, this will be the method for the request. By default it wil be `GET` because it is the most common, but it can be overwritten to be something else. Again you are not limited to http methods, it fully depends on what an extension sends out via an update event.

---

### road.error(middlewareId, [updateType])

```
road.error('log')
```

_Whenever the stack of middleware that is updated throws an error, it will be redirected to error middleware. You can use it to render alternative content or log the errors. The `relay` object will have a new property `relay.error` with the error message._

**middlewareId:string**  
Identifier you added by using the `middleware` method. It needs to be a string and should match to a middleware function, otherwise it will throw.

**[updateType:string]**  
The update type is an extra layer for matching middleware, if we use a http protocol to update the road, this will be the method for the request. By default it wil be `GET` because it is the most common, but it can be overwritten to be something else. Again you are not limited to http methods, it fully depends on what an extension sends out via an update event.

---

### road.noMatch(middlewareId, [updateType])

```
road.noMatch('log');
```

_When no middleware could be found for a current combination of `matchValue` and `updateType`, the `noMatch` middleware will be called, this is handy if you want to return a 404 page or something similar._

**middlewareId:string**  
Identifier you added by using the `middleware` method. It needs to be a string and should match to a middleware function, otherwise it will throw.

**[updateType:string]**  
The update type is an extra layer for matching middleware, if we use a http protocol to update the road, this will be the method for the request. By default it wil be `GET` because it is the most common, but it can be overwritten to be something else. Again you are not limited to http methods, it fully depends on what an extension sends out via an update event.

---

### road.done(middlewareId, [updateType])

```
road.done('response', 'post');
```

_The `done` method is called as the last method in the stack, it is typically used to render output (html or json) to a client_

**middlewareId:string**  
Identifier you added by using the `middleware` method. It needs to be a string and should match to a middleware function, otherwise it will throw.

**[updateType:string]**  
The update type is an extra layer for matching middleware, if we use a http protocol to update the road, this will be the method for the request. By default it wil be `GET` because it is the most common, but it can be overwritten to be something else. Again you are not limited to http methods, it fully depends on what an extension sends out via an update event.

---

### road.update(options:object, [...parameters])

```
road.update({ matchValue : '/somepath', updateType : 'post' }, parameterOne, parameterTwo);
```
_Manually trigger an upadte cycle to the road by calling the `update` method._

**options.matchValue:string**  
A match value in most webapps can be thought of as an url path, but it is not limited to paths only. Frankly it can be any string you can think of, even a JSON string to match on JSON content. Or in an even more exotic example you can match Raspberry pie sensor outputs via an extension to string values and let that trigger middleware. You can use the `*` as a wildcard to match on all match values that might come in.

**options.updateType:string**  
The update type is an extra layer for matching middleware, if we use a http protocol to update the road, this will be the method for the request. By default it wil be `GET` because it is the most common, but it can be overwritten to be something else. Again you are not limited to http methods, it fully depends on what an extension sends out via an update event.

**parameters:\***  
Each update can be have custom parameters that will be available as middleware arguments. This could be for example the `request` and `response` object on a router update.

> Read more about parameters in the [middleware](https://lagoonroad.com/guide#middleware) section.
> Every time a update method is called the middleware that matches will be added to the stack of middleware that needs to be executed. So when calling this on the server you might send out a response and afterwards more middleware will be called. Therefore use it on the client mainly to initialize events. Make sure you fully understand the middelware stack before start using the update function.
