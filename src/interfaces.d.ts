import flags from './util/flags'

interface Flags {
  file?: string
  overwrite?: boolean
  quiet?: boolean
  expanded?: boolean
}

// type Flags<F> = {
//   chars: flags.map(i => i.char)
// }
