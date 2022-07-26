class AlbumsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.createAlbumsHandler = this.createAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.editAlbumByIdHandler = this.editAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postLikeAlbumHandler = this.postLikeAlbumHandler.bind(this);
    this.getAlbumLikeByIdHandler = this.getAlbumLikeByIdHandler.bind(this);
  }

  async createAlbumsHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this.service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this.service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async editAlbumByIdHandler(request) {
    this.validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this.service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this.service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postLikeAlbumHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyAvailabilityAlbums(id);

    const isLiked = await this.service.isAlbumLikedByUser(credentialId, id);

    if (isLiked) {
      await this.service.unlikeAlbumById({ userId: credentialId, albumId: id });
      const response = h.response({
        status: 'success',
        message: 'Anda telah menghapus album yang anda sukai',
      });
      response.code(201);
      return response;
    }

    await this.service.likeAlbumById({ userId: credentialId, albumId: id });

    const response = h.response({
      status: 'success',
      message: 'Album baru telah Anda sukai',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikeByIdHandler(request, h) {
    const { id } = request.params;

    const { likes, source } = await this.service.getTotalLikesAlbum(id);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.header('X-Data-Source', source);
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
