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
    // there's a standard-formtter (traced back to babel) bug including newlines in template string
    // see: https://github.com/millermedeiros/esformatter/issues/414
    // res += (`${key}="${obj[key]}"\n`)
    res += (`${key}="${obj[key]}"` + '\n')
  })
  return res
}

function objFromFileFormat (s, quiet) {
  let res = {}
  let data = s.split('\n')
  data.forEach(function (v) {
    let config = v.match(/^([A-Za-z0-9_]+)="?(.*)$/)
    if (config) {
      let key = config[1]
      // strip off trailing " if it's there
      let value = config[2].replace(/"$/, '')
      if (res[key] && !quiet) { cli.warn(`WARN - "${key}" is in env file twice`) }
      res[key] = value
    }
  })
  return res
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
  }
}
