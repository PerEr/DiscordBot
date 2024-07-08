// foo.js
const { createSuccessResponse } = require('./util');

module.exports = {
  name: 'foo',
  description: 'replies with bar ;/',
  type: 1,
  execute: async (body) => {
    return createSuccessResponse("bar");
  }
};