const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(producerService, playlistService, validator) {
    this.producerService = producerService;
    this.playlistService = playlistService;
    this.validator = validator;

    this.postExportPlaylistByIdHandler = this.postExportPlaylistByIdHandler.bind(this);
  }

  async postExportPlaylistByIdHandler(request, h) {
    try {
      this.validator.validateExportPlaylistsPayload(request.payload);
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this.playlistService.verifyPlaylistAccess(id, credentialId);

      const message = {
        userId: credentialId,
        playlistId: id,
        targetEmail: request.payload.targetEmail,
      };

      await this.producerService.sendMessage('export:playlists', JSON.stringify(message));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      /** SERVER ERROR! */
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = ExportsHandler;
