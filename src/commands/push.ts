'use strict'

const cli: any = require('heroku-cli-util')

import merge from '../util/merge'
import * as file from '../util/file'
import * as _ from 'lodash'
import flags from '../util/flags'

async function patchConfig(
  context: any,
  heroku: any,
  payload: any,
  success: any
) {
  try {
    await heroku.patch(`/apps/${context.app}/config-vars`, { body: payload })
    if (!context.flags.quiet) {
      cli.log(success)
    }
  } catch (err) {
    cli.exit(1, err)
  }
}

async function push(context: any, heroku: any) {
  let fname = context.flags.file // this gets defaulted in read
  let config = await {
    remote: heroku.get(`/apps/${context.app}/config-vars`),
    local: file.read(fname, context.flags)
  }

  let res = merge(config.local, config.remote, context.flags)
  await patchConfig(
    context,
    heroku,
    res,
    'Successfully wrote settings to Heroku!'
  )

  if (context.flags.clean) {
    // grab keys that weren't in local
    let keysToDelete = _.difference(
      Object.keys(config.remote),
      Object.keys(config.local)
    )
    let nullKeys = _.fromPairs(keysToDelete.map(k => [k, null]))

    await patchConfig(
      context,
      heroku,
      nullKeys,
      'Successfully deleted unused settings from Heroku!'
    )
  }
}

module.exports = (() => {
  const mergedFlags = _.flatten([
    flags,
    {
      name: 'clean',
      char: 'c',
      description:
        'delete all destination vars that do not appear in local file'
    }
  ])

  return {
    topic: 'config',
    command: 'push',
    description: 'push env variables to heroku',
    help:
      'Write local config vars into heroku, favoring existing remote configs in case of collision',
    needsApp: true,
    needsAuth: true,
    run: cli.command(push),
    flags: flags
  }
})()
