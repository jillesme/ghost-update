#!/usr/bin/env node

var program = require('commander');
var exec = require('child_process').exec;

program
  .version('0.1.0')
  .description('Ghost Platform Auto Updater')
  .option('-p --path <path>', 'Ghost installation path')
  .parse(process.argv);

var path = program.path.charAt(program.path.length - 1) === '/' ? program.path : program.path + '/';

var tmpFolder = '_tmp';
var commands = [
  {
    cmd: 'mkdir ' + tmpFolder,
    msg: 'Creating temporary folder'
  },
  {
    cmd: 'curl -L -O https://ghost.org/zip/ghost-latest.zip',
    msg: 'Downloading latest Ghost',
    cwd: path + tmpFolder
  },
  {
    cmd: 'unzip ghost-latest.zip',
    msg: 'Unzipping latest Ghost project file',
    cwd: path + tmpFolder
  },
  {
    cmd: 'sudo cp '+ tmpFolder +'/*.md ' + tmpFolder + '/*.js ' + tmpFolder + '/*.json .',
    msg: 'Copying new markdown, JavaScript and json files'
  },
  {
    cmd: 'sudo rm -R core',
    msg: 'Remove old core folder'
  },
  {
    cmd: 'sudo cp -R ' + tmpFolder + '/core .',
    msg: 'Copying new core folder'
  },
  {
    cmd: 'sudo cp -R ' + tmpFolder + '/content/themes/casper content/themes',
    msg: 'Copying new Casper theme'
  },
  {
    cmd: 'sudo npm install --production',
    msg: 'Installing new dependencies (may take a while)'
  },
  {
    cmd: 'sudo rm -R ' + tmpFolder,
    msg: 'Removing temporary folder'
  },
  // TODO: Make this optional?
  {
    cmd: 'sudo chown -R ghost:ghost .',
    msg: 'Resetting permissions'
  }
];

var status = {
  done: '✅',
  error: '❌'
}

function executeCommands (steps) {
  var step = steps.shift();
  if (!step) {
    console.log('-- UPDATE COMPLETED --');
    return;
  }
  process.stdout.write('\n' + step.msg);
  exec(
    step.cmd,
    { cwd: step.cwd ? step.cwd : path },
    function (err, stdOut, stdErr) {
      if (!err) {
        process.stdout.write(' ' + status.done + '\n');
        executeCommands(steps);
      } else {
        // TODO: add rollBack() function that reverts everything that has been done
        // up until failure
        console.error(status.error + '\n' + stdErr.toString());
      }
    });
}

console.log('-- UPDATE STARTED --');
executeCommands(commands)
