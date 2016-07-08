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
function fetchCMD (name) {
  return commands.find((c) => c.command === name)
}

function setup () {
  cli.raiseErrors = true
}

function defaultFS () {
  // this is so I can setup without affecting other tests
  return {
    '.env': fixtures.local_file,
    'other.txt': fixtures.local_file,
    'dnt': mock.file({mode: '000'})
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
  sample_file: header + 'PIZZA="Abo\'s"\nNAME="david"\n\n#this is a comment!\nCITY=boulder\n\n\n',
  clean_sample_file: header + 'CITY="boulder"\nNAME="david"\nPIZZA="Abo\'s"\n',
  sample_obj: { NAME: 'david', CITY: 'boulder', PIZZA: "Abo's" }
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
    mock(defaultFS())
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
    mock(defaultFS())
  })

  it('should fail to read from a file it lacks permissions for', () => {
    return expect(file.write({}, 'dnt')).to.be.rejectedWith(Error)
  })

  it('should successfully write a file', () => {
    return file.write(fixtures.sample_obj).then(() => {
      let res = fs.readFileSync('.env', 'utf-8')
      expect(res).to.equal(fixtures.clean_sample_file)
    })
  })

  afterEach(() => {
    mock.restore()
  })
})

describe('Transforming', () => {
  it('should decode files correctly', () => {
    expect(file.__get__('objFromFileFormat')(fixtures.sample_file)).to.deep.equal(fixtures.sample_obj)
  })

  it('should encode file correctly', () => {
    expect(file.__get__('objToFileFormat')(fixtures.sample_obj)).to.equal(fixtures.clean_sample_file)
  })
})

describe('Pushing', () => {
  beforeEach(() => {
    cli.mockConsole()
    mock(defaultFS())
  })

  it('should correctly push configs w/ flags', () => {
    nock('https://api.heroku.com:443')
      .get('/apps/test/config-vars')
      .reply(200, fixtures.remote_obj)

    // this will fail if we don't pass the correct body, as intended
    nock('https://api.heroku.com:443')
      .patch('/apps/test/config-vars', fixtures.remote_win_obj)
      .reply(200, fixtures.remote_win_obj)

    // fetch the updated value
    nock('https://api.heroku.com:443')
      .get('/apps/test/config-vars')
      .reply(200, fixtures.remote_win_obj)

    let cmd = fetchCMD('push')
    let fname = 'other.txt'
    return cmd.run({flags: {file: fname}, app: 'test'}).then(() => {
      return cli.got('https://api.heroku.com:443/apps/test/config-vars')
    }).then((res) => {
      expect(JSON.parse(res.body)).to.deep.equal(fixtures.remote_win_obj)
    })
  })

  afterEach(() => {
    mock.restore()
  })
})

describe('Pulling', () => {
  beforeEach(() => {
    cli.mockConsole()
    mock(defaultFS())
  })

  it('should correctly pull configs', () => {
    nock('https://api.heroku.com:443')
      .get('/apps/test/config-vars')
      .reply(200, fixtures.remote_obj)

    let cmd = fetchCMD('pull')
    let fname = 'other.txt'
    return cmd.run({flags: {file: fname}, app: 'test'}).then(() => {
      let res = fs.readFileSync(fname, 'utf-8')
      expect(res).to.include(fixtures.merged_local_file)
    })
  })

  afterEach(() => {
    mock.restore()
  })
})
