# lr-main reference

## Changelog in v2.0.0
- Simplified code and usage, reduced package by almost 90% to 1.3KB
- Parallel processing, speeding up and non blocking
- Removed the complete next callback, working with returns
- Simpler interface, no more relay, you have control over the complete road at runtime
- Dynamic assignment of callbacks (previously middleware) is now possible
- Extensions are not so deeply nested anymore
-

The _lr-main_ package is the only mandatory package for Lagoon road. This package connects everything together, regardless of environment.

| Information | - |
| ----------- | - |
| Code coverage | [![Coverage Status](https://coveralls.io/repos/github/lagoon-road/lr-main/badge.svg?branch=master)](https://coveralls.io/github/lagoon-road/lr-main?branch=master) |
| Repo link | [lr-main](https://github.com/lagoon-road/lr-main) |
| Dependencies | [check-types](https://github.com/philbooth/check-types.js) |
| Size (Gzip)| 1.3KB |
| Version | 2.0.0 |
| License | MIT |
| Usage | [guide](https://lagoonroad.com/guide) |

---

### core(environmentId)  
```
const road = require('lr-main')('webserver');
```
**environmentId:string**  
The primary environment id for the road, this is the executing environment that will be used when an update event is fired.  

---

### road.parser(parser)
```
const parser = require('lr-url-parser')();
road.parser(parser);
```
**parser:object**  
The parser that you want to use to parse an incoming matchValue. It expects two functions in the object, `add` and `parse`. Read more about parsers in the [guide](https://lagoonroad.com/guide/writing-parsers)

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
Tell the core if on initialization the extension needs to be executed. This is typically for extensions that use update events to trigger updates to the road. Read more about [extensions](https://lagoonroad.com/guide/writing-extensions) in the guide.

> Extensions are available on the road object in the callback
> ```
> module.exports = road => {
>   console.log(road.extensionName);
> }
>```

---

### road.callback(id, callbackFunction)
```
road.callback('debug', road => { console.log(road) });
```
**id:string**  
Unique id to identify the current callback function

**callbackFunction:function**
The actual function that you want to call, it will have the road as parameter and some optional paramaters that might have been given by the update event.
```
module.exports = road => {
  // body
  return { key : value } // Return an object, this will be added to the road object
}
```


---

### road.where(environmentId, [...environmentId])

```
road.where('webserver', 'client');
```

**environmentId**  
The where method expects at least one argument, which should be a string. This is an environment id to which all the following callback will be assigned. If you want to assign callback to multiple environments you can just specify several ids like in the example above.

---

### road.run(matchValue, callbackId, [matchValue])

```
road
  .run('*', 'log');          // All matches
  .run('/some-url', 'log');  // This specific match
  .run('-/some-url', 'log'); // Everything except this match
```

**matchValue:string**  
A match value in most webapps can be thought of as an url path, but it is not limited to paths only. Frankly it can be any string you can think of, even a JSON string to match on JSON content. Or in an even more exotic example you can match Raspberry Pie sensor outputs via an extension to string values and let that trigger callbacks. You can use the `*` as a wildcard to match on all match values that might come in or `-` if you want to run it on all the paths except the given one.

**callbackId:string**  
Identifier you added by using the `callback` method. It needs to be a string and should match to a callback function, otherwise it will throw an error.

**[updateType:string]**  
The update type is an extra layer for matching callback, if we use a http protocol to update the road, this will be the method for the request. By default it wil be `GET` because it is the most common, but it can be overwritten to be something else. Again you are not limited to http methods, it fully depends on what an extension sends out via an update event.

---

### road.fail(callbackId)

```
road.fail('log')
```

_Whenever a callback throws an error, it will be redirected to error callback. You can use it to render alternative content or log the errors. The `road` object will have a new property `error` with the error. The fail method will also be called when no callbacks could be found for the current matchValue._

**callbackId:string**  
Identifier you added by using the `callback` method. It needs to be a string and should match to a callback function, otherwise it will throw.

---

### road.update(options:object, [...parameters])

```
road.update({ matchValue : '/somepath', updateType : 'post' }, parameterOne, parameterTwo);
```
_Manually trigger an update event to the road by calling the `update` method._

**options.matchValue:string**  
A match value in most webapps can be thought of as an url path, but it is not limited to paths only. Frankly it can be any string you can think of, even a JSON string to match on JSON content. Or in an even more exotic example you can match Raspberry pie sensor outputs via an extension to string values and let that trigger callback. You can use the `*` as a wildcard to match on all match values that might come in.

**options.updateType:string**  
The update type is an extra layer for matching callback, if we use a http protocol to update the road, this will be the method for the request. By default it wil be `GET` because it is the most common, but it can be overwritten to be something else. Again you are not limited to http methods, it fully depends on what an extension sends out via an update event.

**parameters:\***  
Each update can be have custom parameters that will be available as callback arguments. This could be for example the `request` and `response` object on a router update.

## Road object
The road object is passed from callback function to callback function.

### road.parameters:object
If you are using a parser that supplies you with parameters like `lr-url-parser`, you can access them via `road.parameters`.

### road.update(options:object):function
See update method for usage.

### road.callbacks:object
All the callbacks that are assigned.

### other
There are more properties on the road object, do a dump to see an overview of all properties and methods.
