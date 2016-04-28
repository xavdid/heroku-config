// interface for reading/writing to .env file
'use strict'

const fs = require('mz/fs')

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
  console.log(s, res)
  return res
}

module.exports = {
  read: (fname) => {
    fname = fname || '.env'
    // could make this async with generator?
    // let data = fs.readFileSync(fname, 'utf-8')
    // console.log(`reading from ${fname}`)
    return fs.readFile(fname, 'utf-8').then((data) => {
      return Promise.resolve(obj_from_file_format(data))
    }).catch(() => {
      console.warn(`CATCH - Unable to read from ${fname}`)
      return Promise.resolve({err: 1})
    })
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
