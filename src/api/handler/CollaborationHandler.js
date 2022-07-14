const ClientError = require('../../exceptions/ClientError');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this.collaborationsService = collaborationsService;
    this.playlistService = playlistsService;
    this.validator = validator;

    this.postCollaborationsHandler = this.postCollaborationsHandler.bind(this);
    this.deleteCollaborationsHandler = this.deleteCollaborationsHandler.bind(this);
  }

  async postCollaborationsHandler(request, h) {
    try {
      this.validator.validateCollaborationPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);
      await this.collaborationsService.verifyRegisteredUserAndPlaylist(userId, playlistId);
      const collaborationId = await this.collaborationsService.addCollaboration(playlistId, userId);

      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collaborationId,
        },
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
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteCollaborationsHandler(request, h) {
    try {
      this.validator.validateCollaborationPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);
      await this.collaborationsService.verifyCollaboration(playlistId, userId);
      await this.collaborationsService.deleteCollaboration(playlistId, userId);

      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = CollaborationsHandler;
