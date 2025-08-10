const anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');

const DISCORD_MESSAGE_LIMIT = 2000;
const MESSAGE_CHUNK_SIZE = 1800;
const NOT_FOUND = -1;

const client = new anthropic.Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const sendFollowUpMessage = async (applicationId, interactionToken, content) => {
  const url = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}`;
  // Discord API has a 2000 character limit, so we need to split messages.
  // We'll split by newline first, then by sentence, and finally by word.
  let chunks = [content];
  if (content.length > DISCORD_MESSAGE_LIMIT) {
    chunks = content.match(new RegExp(`[\\s\\S]{1,${DISCORD_MESSAGE_LIMIT}}`, 'g')) || [];
  }

  for (const chunk of chunks) {
    if (chunk.length > 0) {
      await axios.post(url, { content: chunk }, { headers: { 'Content-Type': 'application/json' } });
    }
  }
};

function createBot(name, description, prompt) {
  return {
    name,
    description,
    type: 1,
    options: [
      {
        name: 'question',
        description: 'The question to ask',
        type: 3, // STRING type
        required: true,
      }
    ],
    execute: async (value, applicationId, interactionToken) => {
      const question = value;

      try {
        const formattedQuery = `Pondering on the question: *${question}* ...`;
        await sendFollowUpMessage(applicationId, interactionToken, formattedQuery);

        const stream = await client.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 4096,
          temperature: 0.7,
          system: prompt,
          stream: true,
          messages: [
            {
              role: "user",
              content: question
            }
          ]
        });

        let messageBuffer = '';
        for await (const chunk of stream) {
          const text = chunk.delta?.text || '';
          if (text) {
            messageBuffer += text;

            if (messageBuffer.length >= MESSAGE_CHUNK_SIZE) {
              let lastBreak = messageBuffer.lastIndexOf('\n');
              if (lastBreak === NOT_FOUND) {
                lastBreak = messageBuffer.lastIndexOf('. ');
              }
              if (lastBreak === NOT_FOUND) {
                lastBreak = MESSAGE_CHUNK_SIZE;
              }

              const toSend = messageBuffer.substring(0, lastBreak + 1);
              messageBuffer = messageBuffer.substring(lastBreak + 1);

              if (toSend) {
                await sendFollowUpMessage(applicationId, interactionToken, toSend);
              }
            }
          }
        }

        if (messageBuffer.length > 0) {
          await sendFollowUpMessage(applicationId, interactionToken, messageBuffer);
        }

      } catch (error) {
        console.error(`Error calling ${name}:`, error);
        await sendFollowUpMessage(applicationId, interactionToken, `An error occurred while processing ${name}.`);
      }
    }
  }
};

module.exports = {
  createBot,
};