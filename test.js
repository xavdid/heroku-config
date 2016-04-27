'use strict'

const test = require('tape')

const merge = require('./util/merge')

let remote = {
  NODE_ENV: 'production',
  NAME: 'david',
  SOURCE: 'remote'
}

let local = {
  NODE_ENV: 'production',
  SOURCE: 'local',
  DB_STRING: 'mongo://blah@thing.mongo.thing.com:4567'
}

test('Merging', (t) => {
  t.equal({
    NODE_ENV: 'production',
    SOURCE: 'local',
    DB_STRING: 'mongo://blah@thing.mongo.thing.com:4567',
    NAME: 'david'
  }, merge(remote, local, {}))
  t.end()
})
