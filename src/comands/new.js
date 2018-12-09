const path = require('path')
const shell = require('shelljs')

exports.options = (yargs) => {
  yargs
    .positional('type', {
      describe: 'project type',
      type: 'string',
      choices: ['app', 'provider']
    })
    .positional('name', {
      describe: 'project name',
      type: 'string'
    })
}

exports.handler = (argv) => {
  const projectType = argv.type
  const projectName = argv.name
  const templatePath = path.join(__dirname, '..', 'templates', projectType)
  const destPath = path.join(process.cwd(), projectName)

  // copy template
  shell.cp('-rf', templatePath, destPath)

  // install dependencies
  shell.cd(destPath)
  shell.exec('npm i')
}