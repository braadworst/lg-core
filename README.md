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

### core(executingEnvironmentId:string, [options:object])

```
const core = require('lr-core');
const road = core('webserver');
```

### road.extension(id:string, extension:*, isUpdater:boolean = false)

```
const router = require('lr-client-router')
const core   = require('lr-core');
const road   = core('client')
  .extension('router', router, true);
```

### road.middleware(newMiddleware:object)

```
const bodyParser = require('body-parser');
const core       = require('lr-core');
const road       = core('webserver')
  .middleware({ bodyParser }, 'bodyParser');
```

### road.where(environmentId:string, [...environmentId:String])

```
const core = require('lr-core');
const road = core('webserver')
  .where('webserver', 'client');
```

### road.run(matchValue:string, middlewareId:string, [updateType:string])

```
const log  = require('log');
const core = require('lr-core');
const road = core('webserver')
  .middleware({ log })
  .run('*', 'log')
```

### road.error(middlewareId:string, [updateType:string])

```
const log  = require('log');
const core = require('lr-core');
const road = core('webserver')
  .middleware({ log })
  .error('log')
```

### road.noMatch(middlewareId:string, [updateType:string])

```
const log  = require('log');
const core = require('lr-core');
const road = core('webserver')
  .middleware({ log })
  .noMatch('log');
```

### road.done(middlewareId:string, [updateType:string])

```
const response = require('response');
const core     = require('lr-core');
const road     = core('webserver')
  .middleware({ response })
  .done('response', 'post');
```

### road.update(options:object, [...parameters])

```
const core     = require('lr-core');
const road     = core('webserver')
  .update({ matchValue : '/somepath', updateType : 'post' })
```
