// interface for reading/writing to .env file
'use strict'

const fs = require('mz/fs')
const cli = require('heroku-cli-util')

const DEFAULT_FNAME = '.env'
const header = '# this file was creatd automatically by heroku-config\n\n'

function obj_to_file_format (obj) {
  let res = `${header}`
  // always write keys alphabetically
  // makes file writing deterministic
  let keys = Object.keys(obj).sort()
  keys.forEach((key) => {
    // there's a bug including newlines in template string
    res += (`${key}="${obj[key]}"` + '\n')
  })
  return res
}

function obj_from_file_format (s) {
  let res = {}
  let data = s.split('\n')
  data.forEach(function (v) {
    let config = v.match(/^([A-Za-z0-9_]+)="?(.*)$/)
    if (config) {
      let key = config[1]
      // strip off trailing " if it's there
      let value = config[2].replace(/"$/, '')
      if (res[key]) { cli.warning(`WARN - ${key} is in env file twice`) }
      res[key] = value
    }
  })
  return res
}

module.exports = {
  read: (fname) => {
    fname = fname || DEFAULT_FNAME
    // let data = fs.readFileSync(fname, 'utf-8')
    return fs.readFile(fname, 'utf-8').then((data) => {
      return Promise.resolve(obj_from_file_format(data))
    }).catch(() => {
      // cli.warning(`WARN - Unable to read from ${fname}`)
      // if it doesn't exist or we can't read, just start from scratch
      return Promise.resolve({})
    })
  },
  write: (obj, fname) => {
    fname = fname || DEFAULT_FNAME
    return fs.writeFile(fname, obj_to_file_format(obj)).then(() => {
      cli.log(`Successfully wrote config to ${fname}!`)
    }).catch((err) => {
      cli.error(`Error writing to file ${fname} (${err.message})`)
    // return Promise.reject()
    // dunno if i actually need to throw this
    // throw new Error()
    })
  }
}
