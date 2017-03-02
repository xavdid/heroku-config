// interface for reading/writing to .env file
'use strict'

const fs = require('mz/fs')
const cli = require('heroku-cli-util')

const DEFAULT_FNAME = '.env'
const header = '# this file was created automatically by heroku-config\n\n'

function objToFileFormat (obj) {
  let res = `${header}`
  // always write keys alphabetically
  // makes file writing deterministic
  let keys = Object.keys(obj).sort()
  keys.forEach((key) => {
    res += (`${key}="${obj[key]}"\n`)
  })
  return res
}

function objFromFileFormat (s, quiet) {
  let res = {}
  let splitter
  // could also use process.platform but this feels more reliable
  if (s.match(/\r\n/)) {
    splitter = '\r\n'
  } else {
    splitter = '\n'
  }
  const data = s.split(splitter)
  data.forEach(function (v) {
    // optional leading export, optional spaces around =
    let config = v.match(/^(export)? ?([A-Za-z0-9_]+) ?= ?"?(.*)$/)
    if (config) {
      let key = config[2]
      // strip off trailing " if it's there
      let value = config[3].replace(/"$/, '')
      if (res[key] && !quiet) { cli.warn(`WARN - "${key}" is in env file twice`) }
      res[key] = value
    } else {
      if (v[0] !== '#' && v !== '' && !quiet) {
        cli.warn(`WARN - unable to parse line: ${v}`)
      }
    }
  })

  return res
}

function question (val) {
  return [
    `Your config has a value called "${val}", which is usually pulled in error.`,
    'Should we:',
    '[d]elete | [i]gnore | [a]lways (delete) | [n]ever (delete)',
    'that key/value pair for this app?'
  ].join('\n\n')
}

module.exports = {
  read: (fname, quiet) => {
    fname = fname || DEFAULT_FNAME
    return fs.readFile(fname, 'utf-8').then((data) => {
      return Promise.resolve(objFromFileFormat(data, quiet))
    }).catch(() => {
      // cli.warn(`WARN - Unable to read from ${fname}`)
      // if it doesn't exist or we can't read, just start from scratch
      return Promise.resolve({})
    })
  },
  write: (obj, fname, quiet) => {
    fname = fname || DEFAULT_FNAME
    return fs.writeFile(fname, objToFileFormat(obj)).then(() => {
      if (!quiet) {
        cli.log(`Successfully wrote config to "${fname}"!`)
      }
    }).catch((err) => {
      return Promise.reject(new Error(`Error writing to file "${fname}" (${err.message})`))
    })
  },
  shouldDeleteProd: function * (context, val) {
    const path = require('path')

    const settingsUrl = path.join(process.env.HOME, '.heroku_config_settings.json')

    let settings
    try {
      settings = JSON.parse(fs.readFileSync(settingsUrl, 'utf-8'))
    } catch (e) {
      settings = {}
    }

    if (settings[context.app] === undefined) {
      let answer = (yield cli.prompt(question(val))).toLowerCase()

      if (answer === 'd' || answer === 'delete') {
        return true
      } else if (answer === 'i' || answer === 'ignore') {
        return false
      } else if (answer === 'a' || answer === 'always') {
        settings[context.app] = true
        fs.writeFileSync(settingsUrl, JSON.stringify(settings))
        return true
      } else if (answer === 'n' || answer === 'never') {
        settings[context.app] = false
        fs.writeFileSync(settingsUrl, JSON.stringify(settings))
        return false
      } else {
        cli.exit(1, 'Invalid command. Use one of [d|i|a|n] instead')
      }
    } else {
      return settings[context.app]
    }
  }
}
