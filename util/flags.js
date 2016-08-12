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
  description: 'suprress all non-error output'
}]
