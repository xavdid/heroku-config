// interface for reading/writing to .env file
'use strict'

const fs = require('fs-extra')
const cli = require('heroku-cli-util')
const HOME_DIR = require('os').homedir()

const DEFAULT_FNAME = '.env'
const header = '# this file was created automatically by https://github.com/xavdid/heroku-config/\n\n'

const objToFileFormat = (obj, flags = {}) => {
  let res = `${header}`
  // always write keys alphabetically
  // makes file writing deterministic
  let keys = Object.keys(obj).sort()
  keys.forEach(key => {
    if (flags.unquoted) {
      res += `${key}=${obj[key]}\n`
    } else {
      res += `${key}="${obj[key]}"\n`
    }
  })
  return res
}

const defaultMulti = () => {
  return {
    key: '',
    values: []
  }
}

// checks whether this is the end of a multi
const isEnding = s => {
  return s[s.length - 1] === '"'
}

const isSkippable = s => {
  return s[0] === '#' || s === ''
}

const unquote = s => {
  return s.replace(/^"|"$/g, '')
}

const objFromFileFormat = (s, flags = {}) => {
  const res = {}
  // could also use process.platform but this feels more reliable
  const splitter = s.match(/\r\n/) ? '\r\n' : '\n'
  let multi = defaultMulti()

  const lines = s.split(splitter)

  let expandedVars = ''
  if (flags.expanded) {
    // this is a regex string that shows non-standard values that are accepted
    expandedVars = String.raw`\.-`
  }

  const lineRegex = new RegExp(
    String.raw`^(export)?\s?([a-zA-Z_][a-zA-Z0-9_${expandedVars}]*)\s?=\s?(.*)$`
  )

  lines.forEach(line => {
    if (isSkippable(line)) {
      return
    }

    let maybeKVPair = line.match(lineRegex)
    if (multi.key) {
      // not a regular looking line, but we're in the middle of a multi
      multi.values.push(line)
      if (isEnding(line)) {
        res[multi.key] = unquote(multi.values.join('\n'))
        multi = defaultMulti()
      }
    } else if (maybeKVPair) {
      // regular line
      let key = maybeKVPair[2]
      const quotedVal = maybeKVPair[3]

      if ((quotedVal[0] === '"') & !isEnding(quotedVal)) {
        // start of multi
        multi.key = key
        multi.values.push(quotedVal)
      } else {
        if (res[key] && !flags.quiet) {
          cli.warn(`[WARN]: "${key}" is in env file twice`)
        }
        res[key] = unquote(quotedVal)
      }
    } else {
      // borked
      if (!flags.quiet) {
        cli.warn(`[WARN]: unable to parse line: ${line}`)
      }
    }
  })

  return res
}

const question = val => {
  return [
    `Your config has a value called "${val}", which is usually pulled in error. Should we:`,
    '[d]elete | [i]gnore | [a]lways (delete) | [n]ever (delete)',
    'that key/value pair for this app?'
  ].join('\n\n')
}

module.exports = {
  read: (fname = DEFAULT_FNAME, flags) => {
    return fs
      .readFile(fname, 'utf-8')
      .then(data => {
        return Promise.resolve(objFromFileFormat(data, flags))
      })
      .catch(() => {
        // if it doesn't exist or we can't read, just start from scratch
        return Promise.resolve({})
      })
  },
  write: (obj, fname = DEFAULT_FNAME, flags = {}) => {
    return fs
      .writeFile(fname, objToFileFormat(obj, flags))
      .then(() => {
        if (!flags.quiet) {
          cli.log(`Successfully wrote config to "${fname}"!`)
        }
      })
      .catch(err => {
        return Promise.reject(
          new Error(`Error writing to file "${fname}" (${err.message})`)
        )
      })
  },
  // eslint-disable-next-line generator-star-spacing
  shouldDeleteProd: function*(context, val) {
    const path = require('path')

    const settingsUrl = path.join(HOME_DIR, '.heroku_config_settings.json')

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
