// const tape      = require('tape');
// const core      = require('../index');
// const datatypes = [{}, [], true, 1];
// const strings   = ['', 'alpha', '0213', 'alpha09213', '@#!', '!@@!#ads', '*', '*regular', '-regular', '-'];
//
// tape('Datatypes invalid throws: environment', test => {
//   datatypes
//     .forEach(datatype => {
//       test.throws(() => { core(datatype) }, /Environment id needs to be a string containing only letters and or numbers/);
//     });
//   test.end();
// });
//
// tape('Datatypes invalid throws: extension', test => {
//   datatypes
//     .forEach(datatype => {
//       test.throws(() => {
//         const road = core('client');
//         road.extension(datatype);
//       }, /Extension id needs to be a string containing only letters and or numbers/);
//     });
//   test.end();
// });
//
// tape('Datatypes invalid throws: middleware', test => {
//   datatypes
//     .forEach(datatype => {
//       test.throws(() => {
//         const road = core('client');
//         road.middleware(datatype);
//       }, /Provided middleware needs to be a non empty object/);
//     });
//   test.end();
// });
//
// tape('Datatypes invalid throws: where', test => {
//   datatypes
//     .forEach(datatype => {
//       test.throws(() => {
//         const road = core('client');
//         road.where(datatype);
//       }, /Environment id needs to be a string containing only letters and or numbers/);
//     });
//   test.end();
// });
//
// tape('Datatypes invalid throws: path', test => {
//   datatypes
//     .forEach(datatype => {
//       test.throws(() => {
//         const road = core('client');
//         road.path(datatype);
//       }, /Path id needs to be a string containing only letters and or numbers/);
//     });
//   datatypes
//     .forEach(datatype => {
//       test.throws(() => {
//         const road = core('client');
//         road.path('somepath', datatype);
//       }, /Path id needs to be a string containing only letters and or numbers/);
//     });
//   test.end();
// });
//
// tape('Datatypes invalid throws: run', test => {
//   datatypes
//     .forEach(datatype => {
//       test.throws(() => {
//         const road = core('client');
//         road.run(datatype);
//       }, /Path id needs to be a string containing only letters and or numbers/);
//     });
//   datatypes
//     .forEach(datatype => {
//       test.throws(() => {
//         const road = core('client');
//         road.run('pathId', datatype);
//       }, /Middleware id needs to be a string containing only letters and or numbers/);
//     });
//   test.end();
// });
//
// // tape('Datatypes invalid throws: runCustom', test => {
// //   datatypes
// //     .forEach(datatype => {
// //       test.throws(() => {
// //         const road = core('client');
// //         road.runCustom(datatype);
// //       }, /Path id needs to be a string containing only letters and or numbers/);
// //     });
// //   datatypes
// //     .forEach(datatype => {
// //       test.throws(() => {
// //         const road = core('client');
// //         road.runCustom('pathId', datatype);
// //       }, /Middleware id needs to be a string containing only letters and or numbers/);
// //     });
// //   datatypes
// //     .forEach(datatype => {
// //       test.throws(() => {
// //         const road = core('client');
// //         road.runCustom('pathId', 'middlewareId', datatype);
// //       }, /Event type needs to be a string containing only letters and or numbers/);
// //     });
// //   test.end();
// // });
