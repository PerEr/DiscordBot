const anthropic = require('@anthropic-ai/sdk');
const util = require('./util');

const client = new anthropic.Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const name = 'grok'
const description = 'Grok the world'
const prompt = 
  "You are a helpful assistant, always correct and thoughtful. " +
  "giving answers with a bit of dry humor.";

module.exports = util.createBot(name, description, prompt);
