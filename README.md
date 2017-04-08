# lg-core reference
Information | - |
- | -
Code coverage | [![Coverage Status](https://coveralls.io/repos/github/lagoon-road/lr-core/badge.svg?branch=master)](https://coveralls.io/github/lagoon-road/lr-core?branch=master)
Repo link | [lr-core](https://github.com/lagoon-road/lr-core)
Dependencies | [check-types](https://www.npmjs.com/package/check-types)
Size (Browserify, Babel, Uglify and Gzip)| 5.3KB
Usage | [lagoonroad.com/guide](https://www.lagoonroad.com/guide)

The _lr-core_ package is the only mandatory package for Lagoon road. This package connects everything together, regardless of environment. There are eight exposed functions that you can use.

### core(executingEnvironmentId:string, [options:object])

```
const core = require('lr-core');
const road = core('webserver');
```
