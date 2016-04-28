'use strict'

const test = require('tape')

const merge = require('./util/merge')
const file = require('./util/file')

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

test('Merging', (t) => {
  t.deepEqual(remote_win, merge(local, remote, {}), 'Remote should overwrite local')
  t.deepEqual(local_win, merge(remote, local, {}), 'Local should overwrite remote')

  t.deepEqual(remote_win, merge(remote, local, {overwrite: true}), 'Remote should overwrite local w/ overwrite')
  t.deepEqual(local_win, merge(local, remote, {overwrite: true}), 'Local should overwrite remote w/overwrite')

  t.end()
})

test('Reading', (t) => {
  t.deepEqual(file.read('asdf'), {}, 'Should return empty object from non-existant file')

  t.end()
})
