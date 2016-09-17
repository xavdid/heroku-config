'use strict'
/* globals describe beforeEach it afterEach */

const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect

const nock = require('nock')
nock.disableNetConnect()

const mock = require('mock-fs')
const rewire = require('rewire')
const fs = require('fs')
const path = require('path')

const co = require('co')
const stdin = require('mock-stdin').stdin()

// heroku stuff
const cli = require('heroku-cli-util')
const commands = require('./index').commands

// things I'm testing
const merge = require('./util/merge')
const file = rewire('./util/file')
const header = file.__get__('header')

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

// https://glebbahmutov.com/blog/unit-testing-cli-programs/
function mockInput (i) {
  process.nextTick(() => {
    stdin.send(i)
  })
}

// val must be true or false
function mockSettingsFile (val) {
  const location = path.join(process.env.HOME, '.heroku_config_settings.json')
  fs.writeFileSync(location, fixtures[`settings_obj_${val}`])
}

function nockFetchConfig (appName) {
  appName = appName || 'test'
  nock('https://api.heroku.com:443')
    .get(`/apps/${appName}/config-vars`)
    .reply(200, fixtures.remote_obj)
}

// FIXTURES
const fixtures = {
  remote_obj: {
    NODE_ENV: 'pRoDuction',
    NAME: 'david',
    SOURCE: 'remote'
  },
  local_obj: {
    NODE_ENV: 'test',
    SOURCE: 'local',
    DB_STRING: 'mongo://blah@thing.mongo.thing.com:4567'
  },
  remote_win_obj: {
    NODE_ENV: 'pRoDuction',
    SOURCE: 'remote',
    DB_STRING: 'mongo://blah@thing.mongo.thing.com:4567',
    NAME: 'david'
  },
  local_win_obj: {
    NODE_ENV: 'test',
    SOURCE: 'local',
    DB_STRING: 'mongo://blah@thing.mongo.thing.com:4567',
    NAME: 'david'
  },

  local_file: '#comment\nNODE_ENV=test\nSOURCE=local\nSOURCE=local\nDB_STRING=mongo://blah@thing.mongo.thing.com:4567\n',
  merged_local_file: header + 'DB_STRING="mongo://blah@thing.mongo.thing.com:4567"\nNAME="david"\nNODE_ENV="test"\nSOURCE="local"\n',

  // test both quote styles
  sample_file: header + 'PIZZA="Abo\'s"\nNAME="david"\n\n#this is a comment!\nCITY=boulder\n\n\n',
  clean_sample_file: header + 'CITY="boulder"\nNAME="david"\nPIZZA="Abo\'s"\n',
  sample_obj: { NAME: 'david', CITY: 'boulder', PIZZA: "Abo's" },
  settings_obj_true: JSON.stringify({ blah: true }),
  settings_obj_false: JSON.stringify({ blah: false })
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
    cli.mockConsole()
  })

  it('should return empty object from non-existant file', () => {
    return expect(file.read('asdf')).to.eventually.deep.equal({})
  })

  it('should read a local file', () => {
    return expect(file.read('.env')).to.eventually.deep.equal(fixtures.local_obj)
  })

  it('should warn about duplicate keys', () => {
    return file.read('.env').then(() => {
      expect(cli.stderr).to.include('"SOURCE" is in env file twice')
    })
  })

  it('should skip warnings in quiet mode', () => {
    return file.read('.env', true).then(() => {
      expect(cli.stderr).to.equal('')
    })
  })

  afterEach(() => {
    mock.restore()
    cli.mockConsole(false)
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

  const fname = '.env'
  it('should successfully write a file, louldly', () => {
    return file.write(fixtures.sample_obj).then(() => {
      const res = fs.readFileSync(fname, 'utf-8')
      expect(res).to.equal(fixtures.clean_sample_file)
      expect(cli.stdout).to.not.equal('')
    })
  })

  it('should successfully write a file, quietly', () => {
    // need to pass all params if i'm passing quiet mode
    return file.write(fixtures.sample_obj, fname, true).then(() => {
      const res = fs.readFileSync(fname, 'utf-8')
      expect(res).to.equal(fixtures.clean_sample_file)
      expect(cli.stdout).to.equal('')
    })
  })

  afterEach(() => {
    mock.restore()
    cli.mockConsole(false)
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

describe('Checking for Prod', () => {
  beforeEach(() => {
    cli.mockConsole()
  })

  it('should delete prod when prompted', () => {
    mockInput('d')
    return co(file.shouldDeleteProd({ app: 'test' })).then((shouldDelete) => {
      expect(shouldDelete).to.equal(true)
    })
  })

  it('should ignore prod when prompted', () => {
    mockInput('i')
    return co(file.shouldDeleteProd({ app: 'test' })).then((shouldDelete) => {
      expect(shouldDelete).to.equal(false)
    })
  })

  it('should read a true settings file if able', () => {
    const testMode = true
    mock()
    mockSettingsFile(testMode)

    return co(file.shouldDeleteProd({ app: 'blah' })).then((shouldDelete) => {
      expect(shouldDelete).to.equal(testMode)
    })
  })

  it('should read a false settings file if able', () => {
    const testMode = false
    mock()
    mockSettingsFile(testMode)

    return co(file.shouldDeleteProd({ app: 'blah' })).then((shouldDelete) => {
      expect(shouldDelete).to.equal(testMode)
    })
  })

  afterEach(() => {
    cli.mockConsole(false)
    mock.restore()
  })
})

describe('Pushing', () => {
  beforeEach(() => {
    cli.mockConsole()
    mock(defaultFS())
  })

  it('should correctly push configs w/ flags', () => {
    const cmd = fetchCMD('push')
    const fname = 'other.txt'

    nockFetchConfig()
    // this will fail if we don't pass the correct body, as intended
    nock('https://api.heroku.com:443')
      .patch('/apps/test/config-vars', fixtures.remote_win_obj)
      .reply(200, fixtures.remote_win_obj)

    // fetch the updated value
    nock('https://api.heroku.com:443')
      .get(`/apps/test/config-vars`)
      .reply(200, fixtures.remote_win_obj)

    return cmd.run({ flags: { file: fname, quiet: true }, app: 'test' }).then(() => {
      return cli.got('https://api.heroku.com:443/apps/test/config-vars')
    }).then((res) => {
      expect(JSON.parse(res.body)).to.deep.equal(fixtures.remote_win_obj)
      expect(cli.stdout).to.equal('')
    })
  })

  afterEach(() => {
    mock.restore()
    cli.mockConsole(false)
  })
})

describe('Pulling', () => {
  beforeEach(() => {
    cli.mockConsole()
    mock(defaultFS())
  })

  const cmd = fetchCMD('pull')

  it('should correctly pull configs', () => {
    const fname = 'other.txt'
    nockFetchConfig()

    return cmd.run({ flags: { file: fname }, app: 'test' }).then(() => {
      const res = fs.readFileSync(fname, 'utf-8')
      expect(res).to.include(fixtures.merged_local_file)
    })
  })

  describe('skipping production value', () => {
    const fname = '.env'
    const appName = 'blah'

    it('should delete value', () => {
      mockSettingsFile(true)
      nockFetchConfig(appName)

      return cmd.run({ flags: { overwrite: true }, app: appName }).then(() => {
        const res = fs.readFileSync(fname, 'utf-8')
        expect(res).not.to.include('pRoDuction')
      })
    })

    it('should not delete value', () => {
      mockSettingsFile(false)
      nockFetchConfig(appName)

      return cmd.run({ flags: { overwrite: true }, app: appName }).then(() => {
        const res = fs.readFileSync(fname, 'utf-8')
        expect(res).to.include('pRoDuction')
      })
    })
  })

  afterEach(() => {
    mock.restore()
    cli.mockConsole(false)
  })
})
