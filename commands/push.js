'use strict'

const cli = require('heroku-cli-util')
const co = require('co')
const merge = require('../util/merge')
const file = require('../util/file')
const array = require('lodash/array')

function * patchConfig (context, heroku, payload, success) {
  try {
    yield heroku.patch(`/apps/${context.app}/config-vars`, { body: payload })
    if (!context.flags.quiet) {
      cli.log(success)
    }
  } catch (err) {
    cli.exit(1, err)
  }
}

function * push (context, heroku) {
  let fname = context.flags.file // this gets defaulted in read
  let config = yield {
    remote: heroku.get(`/apps/${context.app}/config-vars`),
    local: file.read(fname, context.flags.quiet)
  }

  let res = merge(config.local, config.remote, context.flags)
  yield patchConfig(context, heroku, res, 'Successfully wrote settings to Heroku!')

  if (context.flags.clean) {
    // grab keys that weren't in local
    let keysToDelete = array.difference(Object.keys(config.remote), Object.keys(config.local))
    let nullKeys = array.fromPairs(keysToDelete.map(k => [k, null]))

    yield patchConfig(context, heroku, nullKeys, 'Successfully deleted unused settings from Heroku!')
  }
}

module.exports = (() => {
  let flags = []
  flags.push(require('../util/flags'))
  flags.push({ name: 'clean', char: 'c', description: 'delete all destination vars that do not appear in local file' })
  return {
    topic: 'config',
    command: 'push',
    description: 'push env variables to heroku',
    help: 'Write local config vars into heroku, favoring existing remote configs in case of collision',
    needsApp: true,
    needsAuth: true,
    run: cli.command(co.wrap(push)),
    flags: array.flatten(flags)
  }
})()
