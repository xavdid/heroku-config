'use strict'
/* globals describe beforeEach it afterEach */

const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect

const nock = require('nock')
nock.disableNetConnect()

const mock = require('mock-fs')
const rewire = require('rewire')
// const fs = require('fs')

// heroku stuff
const cli = require('heroku-cli-util')
const commands = require('./index').commands

// things I'm testing
const merge = require('./util/merge')
const file = rewire('./util/file')
const header = file.__get__('header')
const fs = require('fs')

// HELPERS
function fetch_cmd (name) {
  return commands.find((c) => c.command === name)
}

function setup () {
  cli.raiseErrors = true
}

function default_fs () {
  // this is so I can setup without affecting other tests
  return {
    '.env': fixtures.local_file,
    'other.txt': fixtures.local_file,
    'dnt': mock.file({mode: '000'}),
    totally: {}
  }
}

// FIXTURES
let fixtures = {
  remote_obj: {
    NODE_ENV: 'production',
    NAME: 'david',
    SOURCE: 'remote'
  }, local_obj: {
    NODE_ENV: 'test',
    SOURCE: 'local',
    DB_STRING: 'mongo://blah@thing.mongo.thing.com:4567'
  }, remote_win_obj: {
    NODE_ENV: 'production',
    SOURCE: 'remote',
    DB_STRING: 'mongo://blah@thing.mongo.thing.com:4567',
    NAME: 'david'
  }, local_win_obj: {
    NODE_ENV: 'test',
    SOURCE: 'local',
    DB_STRING: 'mongo://blah@thing.mongo.thing.com:4567',
    NAME: 'david'
  },
  local_file: '#comment\nNODE_ENV=test\nSOURCE=local\n\nDB_STRING=mongo://blah@thing.mongo.thing.com:4567\n',
  merged_local_file: header + 'DB_STRING="mongo://blah@thing.mongo.thing.com:4567"\nNAME="david"\nNODE_ENV="test"\nSOURCE="local"\n',
  // test both quote styles
  sample_file: header + 'NAME="david"\n\n#this is a comment!\nCITY=boulder\n\n\n',
  clean_sample_file: header + 'CITY="boulder"\nNAME="david"\n',
  sample_obj: { NAME: 'david', CITY: 'boulder' }
}

// TESTS
setup()

describe('Merging', () => {
  it('should overwrite local with remote', () => {
    expect(merge(fixtures.local_obj, fixtures.remote_obj, {})).to.deep.equal(fixtures.remote_win_obj)
  })
  it('should overwrite remote with local', () => {
    expect(merge(fixtures.remote_obj, fixtures.local_obj, {})).to.deep.equal(fixtures.local_win_obj)
  })

  it('should overwrite local with remote w/override', () => {
    expect(merge(fixtures.remote_obj, fixtures.local_obj, {overwrite: true})).to.deep.equal(fixtures.remote_win_obj)
  })

  it('should overwrite remote with local w/override', () => {
    expect(merge(fixtures.local_obj, fixtures.remote_obj, {overwrite: true})).to.deep.equal(fixtures.local_win_obj)
  })
})

describe('Reading', () => {
  beforeEach(() => {
    mock(default_fs())
  })

  it('should return empty object from non-existant file', () => {
    return expect(file.read('asdf')).to.eventually.deep.equal({})
  })

  it('should read a local file', () => {
    return expect(file.read('.env')).to.eventually.deep.equal(fixtures.local_obj)
  })

  afterEach(() => {
    mock.restore()
  })
})

describe('Writing', () => {
  beforeEach(() => {
    cli.mockConsole()
    mock(default_fs())
  })

  it('should fail to read from a file it lacks permissions for', () => {
    return file.write({}, 'dnt').then(() => {
      expect(cli.stderr).to.contain('EACCES, permission denied')
    })
  })

  // it('should successfully write a file', () => {
  //   return file.write(fixtures.local_obj).then(() => {
  //     let res = require('fs').readFileSync('.env')
  //   })
  // })

  afterEach(() => {
    mock.restore()
  })
})

describe('Transforming', () => {
  it('should decode files correctly', () => {
    expect(file.__get__('obj_from_file_format')(fixtures.sample_file)).to.deep.equal(fixtures.sample_obj)
  })

  it('should encode file correctly', () => {
    expect(file.__get__('obj_to_file_format')(fixtures.sample_obj)).to.equal(fixtures.clean_sample_file)
  })
})

// describe('Pushing', {skip: true}, (t) => {
//   let api_get = nock('https://api.heroku.com:443')
//     .get('/apps/test/config-vars')
//     .reply(200, remote)

//   let api_patch = nock('https://api.heroku.com:443')
//     .patch('/apps/test/config-vars')
//     .reply(200, remote_win_obj)

//   let cmd = fetch_cmd('mypush')
// })

describe('Pulling', () => {
  beforeEach(() => {
    cli.mockConsole()
    mock(default_fs())
  })

  it('should correctly pull configs', () => {
    nock('https://api.heroku.com:443')
      .get('/apps/test/config-vars')
      .reply(200, fixtures.remote_obj)

    let cmd = fetch_cmd('mypull')
    return cmd.run({flags: {}, app: 'test'}).then(() => {
      let res = fs.readFileSync('.env', 'utf-8')
      expect(res).to.include(fixtures.merged_local_file)
    })
  })

  afterEach(() => {
    mock.restore()
  })
})
