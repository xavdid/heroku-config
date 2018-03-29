'use strict'

const cli = require('heroku-cli-util')
const co = require('co')
const _ = require('lodash')

const merge = require('../util/merge')
const file = require('../util/file')

// eslint-disable-next-line generator-star-spacing, space-before-function-paren
function* pull(context, heroku) {
  let fname = context.flags.file // this gets defaulted in read
  let config = yield {
    remote: heroku.get(`/apps/${context.app}/config-vars`),
    local: file.read(fname, context.flags)
  }
  let res = merge(config.remote, config.local, context.flags)

  const prodVal = _.values(res).find(i => i.match(/^prod/i))

  if (prodVal && (yield file.shouldDeleteProd(context, prodVal))) {
    const k = _.findKey(res, i => i === prodVal)
    delete res[k]
  }

  try {
    // write handles success/fail message
    yield file.write(res, fname, context.flags)
  } catch (err) {
    cli.exit(1, err)
  }
}

module.exports = (() => {
  let flags = [
    ...require('../util/flags'),
    {
      name: 'unquoted',
      char: 'u',
      description: 'write configs locally without quotes'
    }
  ]

  return {
    topic: 'config',
    command: 'pull',
    description: 'pull env variables from heroku',
    help:
      'Write remote config vars into file FILE, favoring existing local configs in case of collision',
    needsApp: true,
    needsAuth: true,
    run: cli.command(co.wrap(pull)),
    flags: flags
  }
})()
