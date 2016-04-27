// merge two env objects
'use strict'

const assign = require('lodash.assign')

module.exports = function (src, dest, flags) {
  console.log(`overwrite is ${flags.overwrite}`)
  // check interactive and overwrite
  if (flags.overwrite) {
    return assign({}, src, dest)
  } else {
    return assign({}, dest, src)
  }
}
