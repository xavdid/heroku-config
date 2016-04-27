'use strict'

let cli = require('heroku-cli-util')
let co  = require('co')
let merge = require('../util/merge');

function* app (context, heroku) {
  let config = yield heroku.get(`/apps/${context.app}/config-vars`)
  cli.debug(config)
  cli.debug(merge({a: 1}, {b: 2}, context.flags));
}

module.exports = {
  topic: 'config',
  command: 'mypull',
  description: 'pulls env variables from heroku',
  help: 'this is helpful?',
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(app)),
  //  # -i, --interactive  # prompt whether to overwrite each config var
  // # -o, --overwrite    # overwrite existing config vars
  // # -e, --env ENV      # specify target filename
  // # -q, --quiet        # suppress output to stdout
  flags: require('../util/flags')
}
