// util.js

/**
 * Creates a standard response object
 * @param {number} statusCode - HTTP status code
 * @param {string} content - Response content
 * @returns {Object} Response object
 */
function createResponse(statusCode, content) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 4,  // This type stands for answer with invocation shown
        data: { content }
      }),
    };
  }
  
  /**
   * Creates a success response
   * @param {string} content - Response content
   * @returns {Object} Success response object
   */
  function createSuccessResponse(content) {
    return createResponse(200, content);
  }
  
  /**
   * Creates an error response
   * @param {string} errorMessage - Error message
   * @returns {Object} Error response object
   */
  function createErrorResponse(errorMessage) {
    return createResponse(200, `Error: ${errorMessage}`);
  }
  
  module.exports = {
    createSuccessResponse,
    createErrorResponse
  };