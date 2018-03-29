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
  }
]
