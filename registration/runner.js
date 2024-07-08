const { loadCommand } = require('./util');

const simulateCommand = async (commandName, value) => {
  try {
    const command = loadCommand(commandName);
    
    if (!command) {
      console.error(`Command '${commandName}' not found.`);
      return;
    }

    console.log(`Executing command: ${command.name}`);
    console.log(`Description: ${command.description}`);
    console.log('Options:', value);

    // Execute the command
    const result = await command.execute(value);
    console.log('Command result:', result);
  } catch (error) {
    console.error('Error executing command:', error);
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: node main.js <command_name> [options]');
    return;
  }

  const commandName = args[0];
  const value = args.slice(1).join(' ') || "";

  await simulateCommand(commandName, value);
};

main();