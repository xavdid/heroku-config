// command line args

module.exports = [
  {
    name: 'file',
    char: 'f',
    hasValue: true,
    description: 'specify target filename'
  },
  {
    name: 'overwrite',
    char: 'o',
    description: 'overwrite destination config vars'
  },
  { name: 'quiet', char: 'q', description: 'supress all non-error output' },
  {
    name: 'expanded',
    char: 'e',
    description: 'allow non-standard characters in variable names'
  }, {
    name: 'pipeline-name',
    description: 'pull or push the configuration of a specific pipeline. If provided, must also specify pipeline-stage',
    hasValue: true
  }, {
    name: 'pipeline-stage',
    description: 'pull or push the configuration of a specific pipeline. If provided, must also specify pipeline-name',
    hasValue: true
  }, {
    name: 'app',
    description: 'app to run command against',
    char: 'a',
    hasValue: true
  }
]
