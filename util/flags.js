// command line args

module.exports = [{
  name: 'env',
  char: 'e',
  hasValue: true,
  description: 'specify target filename'
}, {
  name: 'interactive',
  char: 'i',
  description: 'prompt whether to overwrite each config var'
}, {
  name: 'overwrite',
  char: 'o',
  description: 'overwrite existing config vars'
}, {
  name: 'quiet',
  char: 'q',
  description: 'suprress output to stdout'
}]
