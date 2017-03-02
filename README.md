# heroku-config

[![npm](https://img.shields.io/npm/v/heroku-config.svg?maxAge=259200)](https://www.npmjs.com/package/heroku-config) [![Travis](https://img.shields.io/travis/xavdid/heroku-config.svg?maxAge=259200)](https://travis-ci.org/xavdid/heroku-config) [![David](https://img.shields.io/david/xavdid/heroku-config.svg?maxAge=259200)](https://david-dm.org/xavdid/heroku-config)


Push and pull your [Heroku](https://www.heroku.com) configs to your local environment.

Heavily inspired by [ddollar's version](https://github.com/ddollar/heroku-config), but using the new Heroku [cli](https://github.com/heroku/cli).

## :warning: Disclaimer :warning:

Running this code has the potential to delete your configurations if misused.

Specifically, the `-o` flag will overwrite values at the destination. Only use that if the source has more up to date info and you're feeling brave. Otherwise, this merges configs and is fairly safe. Just thought you should know.

Also, the `-c` flag will _delete_ values that didn't exist locally when you pushed. Only use it if you know that.

## Usage

You can install the package by running

```shell
heroku plugins:install heroku-config

```

This package includes two commands:

* `heroku config:pull`: Writes the contents of `heroku config` into a local file
* `heroku config:push`: Writes the contents of a local file into `heroku config`

Run `heroku help config:pull` and `heroku help config:push` to see a full list of flags.

### File Format

There's a lot of flexibility when it comes to how you can format your file. Key capitalization can go either way and there can be spacing around the `=` on one, both, or neither side. There can also be a leading `export` if you want to use the same file to populate your local environment. Since heroku [runs on linux](https://devcenter.heroku.com/articles/stack#cedar), variable names must conform to those valid in [unix](https://stackoverflow.com/questions/2821043/allowed-characters-in-linux-environment-variable-names/2821183#2821183). As of `v1.3.2` we support both unix and windows-style newlines!

All of the following are valid lines:

```
#comment
NODE_ENV= test
source =local
job = programming
DB_STRING=mongo://blah@thing.mongo.thing.com:4567
export THING
```

The following are all invalid lines:

```
 # comment with leading space
key with-dash=andspace
```

## Development

You'll need Node version `>= 6.0`. If you want to match exactly, check out the heroku cli's node version [here](https://github.com/heroku/cli/blob/master/Makefile#4). I like [nvm](https://github.com/creationix/nvm) for managing multiple node versions.

After cloning, follow [these](https://devcenter.heroku.com/articles/developing-cli-plug-ins#installing-the-plugin) instructions to run locally! I welcome pull requests with fixes or new features.
