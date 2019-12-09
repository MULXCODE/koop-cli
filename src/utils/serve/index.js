const path = require('path')
const fs = require('fs-extra')
const execa = require('execa')
const nodemon = require('nodemon')
const os = require('os')

module.exports = async (cwd, options = {}) => {
  const koopConfig = await fs.readJson(path.join(cwd, 'koop.json'))
  // for test mocking
  const dirname = options.dirname || __dirname
  let command = ''

  if (options.path) {
    // run the test server file if provided
    command = path.join(cwd, options.path)
  } else if (koopConfig.type === 'app') {
    // if it is an app, run it directly
    const packageInfo = await fs.readJson(path.join(cwd, 'package.json'))
    command = path.join(cwd, packageInfo.main)
  } else {
    // otherwise, this is a plugin and we should run a Koop server for it

    // if the plugin isn't a provider, the user should provide a test data file
    // for the dev-provider
    if (
      koopConfig.type !== 'provider' && (
        !options.data ||
        !options.data.endsWith('.geojson') ||
        !(await fs.pathExists(path.join(cwd, options.data)))
      )
    ) {
      throw new Error('A GeoJSON file is requried to provide test data for the dev server.')
    }

    command = `${path.join(dirname, './serve-plugin')} --cwd=${cwd}`

    if (options.data) {
      command += ` --data-path=${options.data}`
    }

    if (options.port) {
      command += ` --port=${options.port}`
    }
  }

  if (options.debug) {
    command = `--inspect ${command}`
  }

  command = `node ${command}`

  if (options.watch) {
    startsWithNodemon(cwd, command)
  } else {
    startsWithNode(cwd, command)
  }
}

function startsWithNode (cwd, command) {
  execa.command(command, {
    cwd,
    stdio: 'inherit'
  })
}

function startsWithNodemon (cwd, command) {
  nodemon({
    exec: command,
    watch: cwd,
    ignore: ['node_modules', '.git']
  })
    .on('restart', function (files) {
      console.log(os.EOL)
      console.log('App restarted due to: ', files)
      console.log(os.EOL)
    })
}