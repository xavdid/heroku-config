'use strict'

const cli = require('heroku-cli-util')
const co = require('co')
const _ = require('lodash')

const merge = require('../util/merge')
const file = require('../util/file')
const { shared: sharedFlags, pipelineFlagsAreValid, buildPullUrl } = require('../util/flags')

// eslint-disable-next-line generator-star-spacing, space-before-function-paren
function* pull(context, heroku) {
  let fname = context.flags.file // this gets defaulted in read

  if (!pipelineFlagsAreValid(context.flags)){
    cli.exit(1, 'If you specify either `pipeline-name` or `pipeline-stage`, specify them both.')
  }

  const pullUrl = yield buildPullUrl(context.flags, cli)

  let config = yield {
    remote: heroku.get(pullUrl),
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
    ...sharedFlags,
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
    // doesn't seem to be documented anywhere, but this works
    // no clue where it plugs into the CLI now, but I found it here:
    // https://github.com/heroku/cli-engine/blob/5004250bd03c0b38e6e33e69ee962a3b50274b20/src/plugins/legacy.ts#L169
    wantsApp: true,
    needsAuth: true,
    run: cli.command(co.wrap(pull)),
    flags
  }
})()
