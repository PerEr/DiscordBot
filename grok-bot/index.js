const nacl = require('tweetnacl');
const path = require('path');
const axios = require('axios');

const createResponse = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

let commandsCache = {};

const loadCommand = async (commandName) => {
  if (!commandsCache[commandName]) {
    const commandPath = path.join(__dirname, 'commands', `cmd_${commandName}.js`);
    commandsCache[commandName] = require(commandPath);
  }
  return commandsCache[commandName];
};

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

const sendDeferredResponse = async (interactionId, interactionToken) => {
  const url = `https://discord.com/api/v10/interactions/${interactionId}/${interactionToken}/callback`;
  await axios.post(url, { type: 5 }, { headers: { 'Content-Type': 'application/json' } });
};

const sendFollowUpMessage = async (applicationId, interactionToken, content) => {
  const url = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}`;
  await axios.post(url, { content }, { headers: { 'Content-Type': 'application/json' } });
};

exports.handler = async (event) => {
  if (!verifySignature(event)) {
    return createResponse(401, { error: 'invalid request signature' });
  }

  const body = JSON.parse(event.body);

  if (body.type === 1) {
    return createResponse(200, { type: 1 });
  }

  if (body.type === 2) { // Application Command
    try {
      const command = await loadCommand(body.data.name);
      if (command) {
        await sendDeferredResponse(body.id, body.token);
        const response = await command.execute(body.data.options[0].value);
        await sendFollowUpMessage(body.application_id, body.token, response.body);
        return createResponse(200, { type: 5 });
      }
    } catch (error) {
      console.error('Error executing {body.data.name}:', error);
      await sendFollowUpMessage(body.application_id, body.token, 'An error occurred while processing {body.data.name}.');
      return createResponse(200, { type: 5 });
    }
  }
  return createResponse(404, { error: 'not found' });
};