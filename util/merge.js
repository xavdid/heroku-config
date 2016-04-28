// merge two env objects
'use strict'

const assign = require('lodash.assign')

module.exports = function (sub, dom, flags) {
  // console.log(`overwrite is ${flags.overwrite}`)
  // check interactive and overwrite

  // blank object is so sources aren't modified
  if (flags.overwrite) {
    return assign({}, dom, sub)
  } else {
    return assign({}, sub, dom)
  }
}
