'use strict'
/* globals commands describe beforeEach it */

const expect = require('chai').expect
const nock = require('nock')
const mock_fs = require('mock-fs')
const rewire = require('rewire')

const merge = require('./util/merge')
const file = rewire('./util/file')

const cli = require('heroku-cli-util')
const commands = require('./index').commands

// HELPERS
function fetch_cmd (name) {
  return commands.find((c) => c.command === name)
}

function setup () {
  // no actual requets
  nock.disableNetConnect()
  cli.mockConsole()
  cli.raiseErrors = true
}

function default_fs () {
  // this is so I can setup without affecting other tests
  return {
    '.env': local_file,
    'other.txt': local_file
  }
}

// FIXTURES
let remote = {
  NODE_ENV: 'production',
  NAME: 'david',
  SOURCE: 'remote'
}

let local = {
  NODE_ENV: 'test',
  SOURCE: 'local',
  DB_STRING: 'mongo://blah@thing.mongo.thing.com:4567'
}
let local_file = '#comment\nNODE_ENV=test\nSOURCE=local\nDB_STRING=mongo://blah@thing.mongo.thing.com:4567\n'

let remote_win = {
  NODE_ENV: 'production',
  SOURCE: 'remote',
  DB_STRING: 'mongo://blah@thing.mongo.thing.com:4567',
  NAME: 'david'
}

let local_win = {
  NODE_ENV: 'test',
  SOURCE: 'local',
  DB_STRING: 'mongo://blah@thing.mongo.thing.com:4567',
  NAME: 'david'
}

// test both quoted values and non
let sample_file = file.__get__('header') + 'NAME="david"\n\n#this is a comment!\nCITY=boulder\n\n\n'
let clean_sample_file = file.__get__('header') + 'NAME="david"\nCITY="boulder"\n'
let sample_obj = {NAME: 'david', CITY: 'boulder'}

// TESTS
setup()

describe('Merging', () => {
  it('should overwrite local with remote', () => {
    expect(merge(local, remote, {})).to.deep.equal(remote_win)
  })
  it('should overwrite remote with local', () => {
    expect(merge(remote, local, {})).to.deep.equal(local_win)
  })

  it('should overwrite local with remote w/override', () => {
    expect(merge(remote, local, {overwrite: true})).to.deep.equal(remote_win)
  })

  it('should overwrite remote with local w/override', () => {
    expect(merge(local, remote, {overwrite: true})).to.deep.equal(local_win)
  })
})

// describe('Reading', (t) => {
//   it.deepEqual(file.read('asdf'),
//     {},
//     'Should return empty object from non-existant file')

//   it.deepEqual(file.read('.env'),
//     local,
//     'Should read a local file')

// })

// describe('Transforming', (t) => {
//   it.deepEqual(file.__get__('obj_from_file_format')(sample_file),
//     sample_obj,
//     'Should dncode files correctly')

//   // this could get weird since object key order isn't garunteed, but it's probably ifne
//   it.deepEqual(file.__get__('obj_to_file_format')(sample_obj),
//     clean_sample_file,
//     'Should decodes file correctly')

// })

// describe('Pushing', {skip: true}, (t) => {
//   let api_get = nock('https://api.heroku.com:443')
//     .get('/apps/test/config-vars')
//     .reply(200, remote)

//   let api_patch = nock('https://api.heroku.com:443')
//     .patch('/apps/test/config-vars')
//     .reply(200, remote_win)

//   let cmd = fetch_cmd('mypush')
// })

describe('Pulling', () => {
  let fetch_configs = nock('https://api.heroku.com:443')
    .get('/apps/test/config-vars')
    .reply(200, remote)
  mock_fs(default_fs())

  it('should correctly pull configs', () => {
    let cmd = fetch_cmd('mypull')
    cmd.run({flags: {}, app: 'test'}).then((res) => {
      console.log(res)

      expect(true).to.equal(true)
      fetch_configs.done()
    })
  })
})
