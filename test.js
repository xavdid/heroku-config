'use strict'

const test = require('tape')

const merge = require('./util/merge')

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
  t.deepEqual(remote_win, merge(local, remote, {}), 'Expect remote to overwrite local')
  t.deepEqual(local_win, merge(remote, local, {}), 'Expect local to overwrite remote')

  t.deepEqual(remote_win, merge(remote, local, {overwrite: true}), 'Expect remote to overwrite local w/ overwrite')
  t.deepEqual(local_win, merge(local, remote, {overwrite: true}), 'Expect local to overwrite remote w/overwrite')

  t.end()
})
