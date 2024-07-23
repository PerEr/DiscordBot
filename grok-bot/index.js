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
      // Immediately respond with a deferred response
      await sendDeferredResponse(body.id, body.token);
      
      const command = await loadCommand(body.data.name);
      if (command) {
        const query = body.data.options[0].value;
        const response = await command.execute(query);
        
        // Send query message
        const formattedQuery = `Pondering on the question: *${query}* ...`;
        await sendFollowUpMessage(body.application_id, body.token, formattedQuery);
        
        // Send response message
        const formattedResponse = `${response.body}`;
        await sendFollowUpMessage(body.application_id, body.token, formattedResponse);
        
        // No need to return another response here
      }
    } catch (error) {
      console.error(`Error executing ${body.data.name}:`, error);
      await sendFollowUpMessage(body.application_id, body.token, `An error occurred while processing ${body.data.name}.`);
    }
    // We've handled the interaction, so just return a 200 OK
    return createResponse(200);
  }
  return createResponse(404, { error: 'not found' });
};