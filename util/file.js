// interface for reading/writing to .env file
'use strict'

const fs = require('fs')
const co = require('co')

function obj_to_file_format (obj) {
  let res = ''
  for (let key in obj) {
    // standard removes the \n char in the ` string?
    res += (`${key}="${obj[key]}"` + '\n')
  }
  return res
}

function obj_from_file_format (s) {
  let res = {}
  let data = s.split('\n')
  for (let v in data) {
    let config = v.match(/^([A-Za-z0-9_]+)="?(.*)$/)
    if (config) {
      let key = config[1]
      // strip off trailing " if it's there
      let value = config[2].replace(/"$/, '')
      if (res[key]) {
        console.warn(`WARN - ${key} is in env file twice`)
      }
      res[key] = value
    }
  }
  return res
}

module.exports = {
  read: (fname) => {
    fname = fname || '.env'
    try {
      // could make this async with generator?
      let data = fs.readFileSync(fname, 'utf-8')
      return obj_from_file_format(data)
    } catch (e) {
      console.warn(`WARN - Unable to read from ${fname}`)
      return {}
    }
  },
  write: (obj, fname) => {
    fname = fname || '.env'
    fs.writeFile(fname, obj_to_file_format(obj).toString(), (err) => {
      if (err) {
        console.error(`Error writing to file ${fname}: ${err.message}`)
      } else {
        console.log(`Successfully wrote config to ${fname}`)
      }
    })
  }
}
