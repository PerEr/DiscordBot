const anthropic = require('@anthropic-ai/sdk');

const client = new anthropic.Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
    execute: async (value) => {
      const question = value;

      try {
        const message = await client.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1000,
          temperature: 0.7,
          system: prompt,
          messages: [
            {
              role: "user",
              content: question
            }
          ]
        });

        const answer = message.content[0].text;

        return { statusCode: 200, body: `${answer}` };
      } catch (error) {
        console.error('Error calling {name}:', error);
        return { statusCode: 500, body: 'Failed to get a response from {name}. Please try again later.' };
      }
    }
  }
};

  module.exports = {
    createBot,
  };