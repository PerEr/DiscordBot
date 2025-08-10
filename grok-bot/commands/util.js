const anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');

const client = new anthropic.Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const sendFollowUpMessage = async (applicationId, interactionToken, content) => {
  const url = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}`;
  // Discord API has a 2000 character limit, so we need to split messages.
  // We'll split by newline first, then by sentence, and finally by word.
  let chunks = [content];
  if (content.length > 2000) {
    chunks = content.match(/[\s\S]{1,2000}/g) || [];
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

            if (messageBuffer.length >= 1800) {
              let lastBreak = messageBuffer.lastIndexOf('\n');
              if (lastBreak === -1) {
                lastBreak = messageBuffer.lastIndexOf('. ');
              }
              if (lastBreak === -1) {
                lastBreak = 1800;
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