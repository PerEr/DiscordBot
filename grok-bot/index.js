const nacl = require('tweetnacl');
const fs = require('fs');
const path = require('path');

// Cache loaded commands
let commandsCache = null;

// Function to load commands
const loadCommands = () => {
  if (!commandsCache) {
    const commandsDir = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsDir);
    commandsCache = commandFiles.reduce((commands, file) => {
      const command = require(path.join(commandsDir, file));
      commands[command.name] = command;
      return commands;
    }, {});
  }
  return commandsCache;
};

// Function to verify request signature
const verifySignature = (event) => {
  const PUBLIC_KEY = process.env.PUBLIC_KEY;
  const signature = event.headers['x-signature-ed25519'];
  const timestamp = event.headers['x-signature-timestamp'];
  const strBody = event.body;

  return nacl.sign.detached.verify(
    Buffer.from(timestamp + strBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  );
};

// Function to generate response
const generateResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
};

exports.handler = async (event) => {

  if (!verifySignature(event)) {
    return generateResponse(401, 'invalid request signature');
  }

  const body = JSON.parse(event.body);

  if (body.type === 1) {
    return generateResponse(200, { "type": 1 });
  }

  const commands = loadCommands();
  const command = commands[body.data.name];
  if (command) {
    return command.execute(body);
  }

  return generateResponse(404, 'command not found');
};
