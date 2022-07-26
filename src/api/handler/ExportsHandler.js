class ExportsHandler {
  constructor(producerService, playlistService, validator) {
    this.producerService = producerService;
    this.playlistService = playlistService;
    this.validator = validator;

    this.postExportPlaylistByIdHandler = this.postExportPlaylistByIdHandler.bind(this);
  }

  async postExportPlaylistByIdHandler(request, h) {
    this.validator.validateExportPlaylistsPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistAccess(id, credentialId);

    const message = {
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
  }
}

module.exports = ExportsHandler;
