'use strict'

const cli: any = require('heroku-cli-util')
import * as _ from 'lodash'

import merge from '../util/merge'
import * as file from '../util/file'
import flags from '../util/flags'

async function pull(context: any, heroku: any) {
  const fname = context.flags.file // this gets defaulted in read
  const config = await {
    remote: heroku.get(`/apps/${context.app}/config-vars`),
    local: file.read(fname, context.flags)
  }
  let res = merge(config.remote, config.local, context.flags)

  const prodVal = _.values(res).find(i => i.match(/^prod/i))

  if (prodVal && (await file.shouldDeleteProd(context, prodVal))) {
    const k = _.findKey(res, i => i === prodVal) as string // we know it's there
    delete res[k]
  }

  try {
    // write handles success/fail message
    await file.write(res, fname, context.flags)
  } catch (err) {
    cli.exit(1, err)
  }
}

module.exports = (() => {
  return {
    topic: 'config',
    command: 'pull',
    description: 'pull env variables from heroku',
    help:
      'Write remote config vars into file FILE, favoring existing local configs in case of collision',
    needsApp: true,
    needsAuth: true,
    run: cli.command(pull),
    flags: flags
  }
})()
