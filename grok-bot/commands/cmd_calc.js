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
  execute: async (value) => {
    const expression =value;

    if (!isValidMathExpression(expression)) {
      return { statusCode: 400, body: `Invalid expression: ${expression}` };
    }

    try {
      const result = evaluateMathExpression(expression);
      return { statusCode: 200, body: `${expression} = ${result}` };
    } catch (error) {
      return { statusCode: 500, body: `Error evaluating expression: ${expression}` };
    }
  }
};