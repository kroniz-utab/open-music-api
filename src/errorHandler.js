const ClientError = require('./exceptions/ClientError');

const errorHandler = (request, h) => {
  const { response } = request;
  if (response instanceof ClientError) {
    const serverResponse = h.response({
      status: 'fail',
      message: response.message,
    });
    serverResponse.code(response.statusCode);
    return serverResponse;
  }
  if (response instanceof Error) {
    const { statusCode, payload } = response.output;
    if (statusCode !== 500) {
      return h.response(payload).code(statusCode);
    }
    const serverResponse = h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    });
    serverResponse.code(500);
    console.error(response);
    return serverResponse;
  }
  return response.continue || response;
};

module.exports = errorHandler;
