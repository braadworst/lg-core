const tape = require('tape');
const core = require('../index');

tape('Usage path id: run', test => {
  let road = core('client')
    .path('home', '/')
    .path('login', '/login')
    .path('about', '/about')
    .path('blog', '/blog')
    .path('blogDetail', '/blog/:id')
    .path('allExceptLogin', 'home', 'about', 'blog', 'blogDetail')
    .path('all', 'allExceptLogin', 'login', 'logout')

  test.equal(typeof road.run('-login', 'middleware'), 'object');
  test.equal(typeof road.run('*', 'middleware'), 'object');
  test.end();
});
