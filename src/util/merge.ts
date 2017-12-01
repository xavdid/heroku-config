// merge two env objects
'use strict'

import { assign } from 'lodash'
import { Flags } from '../interfaces'

export default (sub: any, dom: any, flags: Flags) => {
  // console.log(`overwrite is ${flags.overwrite}`)
  // check interactive and overwrite

  // blank object is so sources aren't modified
  if (flags.overwrite) {
    return assign({}, dom, sub)
  } else {
    return assign({}, sub, dom)
  }
}
