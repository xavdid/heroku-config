// command line args

module.exports = [{
  name: 'file',
  char: 'f',
  hasValue: true,
  description: 'specify target filename'
}, {
  // i'll do this later
  //   name: 'interactive',
  //   char: 'i',
  //   description: 'prompt whether to overwrite each config var'
  // }, {
  name: 'overwrite',
  char: 'o',
  description: 'overwrite destination config vars'
}, {
  name: 'quiet',
  char: 'q',
  description: 'supress all non-error output'
}, {
  name: 'clean',
  char: 'c',
  description: '(push only) delete all destination vars that do not appear in local file'
}]
