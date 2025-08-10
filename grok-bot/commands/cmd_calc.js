const axios = require('axios');

const sendFollowUpMessage = async (applicationId, interactionToken, content) => {
  const url = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}`;
  await axios.post(url, { content }, { headers: { 'Content-Type': 'application/json' } });
};

function isValidMathExpression(expression) {
  const validExpression = /^[0-9+\-*/().\s]+$/;
  return validExpression.test(expression);
}

function evaluateMathExpression(expression) {
  return Function(`"use strict"; return (${expression})`)();
}

module.exports = {
  name: 'calc',
  description: 'evaluates a mathematical expression',
  type: 1,
  options: [
    {
      name: 'expression',
      description: 'The mathematical expression to evaluate',
      type: 3, // STRING type
      required: true,
    }
  ],
  execute: async (value, applicationId, interactionToken) => {
    const expression = value;

    if (!isValidMathExpression(expression)) {
      await sendFollowUpMessage(applicationId, interactionToken, `Invalid expression: ${expression}`);
      return;
    }

    try {
      const result = evaluateMathExpression(expression);
      await sendFollowUpMessage(applicationId, interactionToken, `${expression} = ${result}`);
    } catch (error) {
      await sendFollowUpMessage(applicationId, interactionToken, `Error evaluating expression: ${expression}`);
    }
  }
};