// interface for reading/writing to .env file

const fs = require('fs')

function obj_to_file_format (obj) {
  let res = ''
  for (let key in obj) {
    res += (`${key}="${obj[key]}"`)
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
    fs.readFile(fname, (err, data) => {
      if (err) {
        console.error(`Unable to read from ${fname}`)
      } else {
        return obj_from_file_format(data)
      }
    })
  },
  write: (fname, obj) => {
    let res = {}

    fs.writeFile(fname, obj_to_file_format(res), (err) => {
      if (err) {
        console.error(`Error writing to file ${fname}: ${err.message}`)
      } else {
        console.log(`Successfully wrote config to ${fname}`)
      }
    })
  }
}
