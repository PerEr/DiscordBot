const fs = require('fs');
const path = require('path');

const commandsDir = path.join(__dirname, '../grok-bot/commands');

function loadCommands() {
  const commands = new Map();
  const files = fs.readdirSync(commandsDir);
  for (const file of files) {
    if (file.startsWith('cmd_')) {
      const commandData = require(path.join(commandsDir, file));
      commands.set(commandData.name, commandData);
    }
  }
  return commands;
}

function loadCommand(commandName) {
  const commandPath = path.join(commandsDir, `cmd_${commandName}.js`);
  return require(commandPath);
}

module.exports = {
  loadCommands,
  loadCommand,
  commandsDir
};