const ClientError = require('../../exceptions/ClientError');

class PlaylistHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getAllPlaylistHandler = this.getAllPlaylistHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongsListFromPlaylistHandler = this.getSongsListFromPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
    this.getPlaylistActivities = this.getPlaylistActivities.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this.validator.validatePlaylistNamePayload(request.payload);
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this.service.addPlaylist({ name, owner: credentialId });

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil dibuat!',
        data: {
          playlistId,
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

  async getAllPlaylistHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;

      await this.service.getMyPlaylist(credentialId);

      const playlists = await this.service.getMyPlaylist(credentialId);

      return {
        status: 'success',
        data: {
          playlists,
        },
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

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this.service.verifyPlaylistOwner(id, credentialId);
      await this.service.deleteMyPlaylistById(id);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus.',
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

  async postSongToPlaylistHandler(request, h) {
    try {
      this.validator.validatePlaylistSongPayload(request.payload);
      const { songId } = request.payload;
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this.service.verifyPlaylistAccess(id, credentialId);
      await this.service.verifyAvailabilitySong(songId);
      await this.service.verifyPlaylistSongs(id, songId);
      await this.service.addSongToPlaylist({ id, songId });
      await this.service.addPlaylistActivities({
        playlistId: id,
        songId,
        userId: credentialId,
        action: 'add',
      });

      const response = h.response({
        status: 'success',
        message: 'lagu berhasil ditambahkan dalam playlist',
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

  async getSongsListFromPlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this.service.verifyPlaylistAccess(id, credentialId);
      const playlist = await this.service.getSongPlaylist(id);
      return {
        status: 'success',
        data: {
          playlist,
        },
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

  async deleteSongFromPlaylistHandler(request, h) {
    try {
      this.validator.validatePlaylistSongPayload(request.payload);
      const { id } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this.service.verifyPlaylistAccess(id, credentialId);
      await this.service.deleteSongOnPlaylist(id, songId);
      await this.service.addPlaylistActivities({
        playlistId: id,
        songId,
        userId: credentialId,
        action: 'delete',
      });

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
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

  async getPlaylistActivities(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this.service.verifyPlaylistAccess(id, credentialId);
      const activities = await this.service.getPlaylistActivitiesById(id);

      return {
        status: 'success',
        data: {
          playlistId: id,
          activities,
        },
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

module.exports = PlaylistHandler;
