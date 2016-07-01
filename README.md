# heroku-config

[![npm](https://img.shields.io/npm/v/heroku-config.svg?maxAge=2592000)](https://www.npmjs.com/package/heroku-config) [![Travis](https://img.shields.io/travis/xavdid/heroku-config.svg?maxAge=2592000)](https://travis-ci.org/xavdid/heroku-config) [![David](https://img.shields.io/david/xavdid/heroku-config.svg?maxAge=2592000)](https://david-dm.org/xavdid/heroku-config)


Push and pull your [Heroku](https://www.heroku.com) configs to your local environment.

Heavily inspired by [ddollar's version](https://github.com/ddollar/heroku-config), but using the new Heroku [cli](https://github.com/heroku/cli).

## :warning: Disclaimer :warning:

Running this code has the potential to delete your configurations if misused.

Specifically, the `-o` flag will overwrite values at the destination. Only use that if the source has more up to date info and you're feeling brave. Otherwise, this merges configs and is fairly safe. Just thought you should know.

## Usage

You can install the package by running

```shell
heroku plugins:install heroku-config

```

This package includes two commands:

* `heroku config:pull`: Writes the contents of `heroku config` into a local file
* `heroku config:push`: Writes the contents of a local file into `heroku config`

Run `heroku help config:pull` and `heroku help config:push` to see a full list of flags.


## Development

After cloning, follow [these](https://devcenter.heroku.com/articles/developing-cli-plug-ins#installing-the-plugin) instructions to run locally! I welcome pull requests with fixes or new features.
