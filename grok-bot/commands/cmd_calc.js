const { createSuccessResponse, createErrorResponse } = require('./util');

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
  execute: async (body) => {
    const expression = body.data.options[0].value;

    if (!isValidMathExpression(expression)) {
      return createErrorResponse(`Invalid expression: ${expression}`);
    }

    try {
      const result = evaluateMathExpression(expression);
      return createSuccessResponse(`${expression} = ${result}`);
    } catch (error) {
      return createErrorResponse(`Error evaluating expression: ${expression}`);
    }
  }
};