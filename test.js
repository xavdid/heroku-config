'use strict'

const test = require('tape')
const rewire = require('rewire')

const merge = require('./util/merge')
const file = rewire('./util/file')

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

// test both quoted values and non
let sample_file = file.__get__('header') + 'NAME="david"\n\n#this is a comment!\nCITY=boulder\n\n\n'
let clean_sample_file = file.__get__('header') + 'NAME="david"\nCITY="boulder"\n'
let sample_obj = {NAME: 'david', CITY: 'boulder'}

test('Merging', (t) => {
  t.deepEqual(remote_win,
    merge(local, remote, {}),
    'Remote should overwrite local')
  t.deepEqual(local_win,
    merge(remote, local, {}),
    'Local should overwrite remote')

  t.deepEqual(remote_win,
    merge(remote, local, {overwrite: true}),
    'Remote should overwrite local w/ overwrite')
  t.deepEqual(local_win,
    merge(local, remote, {overwrite: true}),
    'Local should overwrite remote w/overwrite')

  t.end()
})

test('Reading', (t) => {
  t.deepEqual(file.read('asdf'),
    {},
    'Should return empty object from non-existant file')

  t.end()
})

test('Transforming', (t) => {
  t.deepEqual(file.__get__('obj_from_file_format')(sample_file),
    sample_obj,
    'Should dncode files correctly')

  t.deepEqual(file.__get__('obj_to_file_format')(sample_obj),
    clean_sample_file,
    'Should decodes file correctly')

  t.end()
})
