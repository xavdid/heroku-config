'use strict'

const cli = require('heroku-cli-util')
const co = require('co')
const merge = require('../util/merge')
const file = require('../util/file')

function * pull (context, heroku) {
  let fname = context.flags.file // this gets defaulted in read
  let config = yield {
    remote: heroku.get(`/apps/${context.app}/config-vars`),
    local: file.read(fname)
  }
  let res = merge(config.remote, config.local, context.flags)
  try {
    // write handles success/fail message
    yield file.write(res, fname)
  } catch (err) {
    cli.exit(1, err)
  }
}

module.exports = {
  topic: 'config',
  command: 'pull',
  description: 'pull env variables from heroku',
  help: 'Write remote config vars into file FILE, favoring existing local configs in case of collision',
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(pull)),
  flags: require('../util/flags')
}
