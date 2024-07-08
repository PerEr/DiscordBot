// baz.js
const { createSuccessResponse } = require('./util');

module.exports = {
  name: 'baz',
  description: 'replies with base ;/',
  type: 1,
  execute: async (body) => {
    return createSuccessResponse("base");
  }
};