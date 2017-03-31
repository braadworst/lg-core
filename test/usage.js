const tape   = require('tape');
const core   = require('../index');
const http   = require('http');
const server = http.createServer();
const router = require('lr-server-router')(server);

// server.listen(4000, function() {
//   console.log(`server running on localhost:4000`);
// });
//
// const response = (next, relay, request, response) => {
//   response.end();
// };
//
// let road = core('client')
//   .extension('router', router, true)
//   .middleware({ response })
//   .path('home', '/')
//   .run('*', 'response');
//
// http.get('http://localhost:4000', response => {
//   console.log(response.statusCode);
//   server.close();
// });

// tape('Usage path id: run', test => {
//
//   let road = core('client')
//     .extension('router', router, true)
//     .path('home', '/')
//     .path('login', '/login')
//     .path('about', '/about')
//     .path('blog', '/blog')
//     .path('blogDetail', '/blog/:id')
//     .path('allExceptLogin', 'home', 'about', 'blog', 'blogDetail')
//     .path('all', 'allExceptLogin', 'login', 'logout')
//
//   test.equal(typeof road.run('-login', 'middleware'), 'object');
//   test.equal(typeof road.run('*', 'middleware'), 'object');
//
//   test.end();
// });
