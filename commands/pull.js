'use strict'

const cli = require('heroku-cli-util')
const co = require('co')
const merge = require('../util/merge')
const file = require('../util/file')

function * pull (context, heroku) {
  let remote = yield heroku.get(`/apps/${context.app}/config-vars`)
  let fname = context.flags.env // this gets defaulted in read
  let local = file.read(fname)

  file.write(merge(remote, local, context.flags), fname)
}

module.exports = {
  topic: 'config',
  command: 'mypull',
  description: 'pulls env variables from heroku',
  help: 'this is helpful?',
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(pull)),
  flags: require('../util/flags')
}
