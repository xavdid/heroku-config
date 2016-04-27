// merge two env objects

const assign = require('lodash.assign');

module.exports = function(src, dest, flags) {
  console.log(`interactive is ${flags.interactive}`);
  // check interactive and overwrite
  return assign({}, src, dest);
}
