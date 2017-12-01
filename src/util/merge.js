// merge two env objects
'use strict'

const _ = require('lodash')

module.exports = (sub, dom, flags) => {
  // console.log(`overwrite is ${flags.overwrite}`)
  // check interactive and overwrite

  // blank object is so sources aren't modified
  if (flags.overwrite) {
    return _.assign({}, dom, sub)
  } else {
    return _.assign({}, sub, dom)
  }
}
