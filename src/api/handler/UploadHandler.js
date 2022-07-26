class UploadHandler {
  constructor(albumsService, storageService, validator) {
    this.albumsService = albumsService;
    this.storageService = storageService;
    this.validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;

    this.validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this.storageService.writeFile(cover, cover.hapi);

    await this.albumsService.editAlbumCoverById(id, filename);

    const response = h.response({
      status: 'success',
      message: 'sampul berhasil diunggah',
      data: {
        fileLocation: `http://${process.env.HOST}:${process.env.PORT}/cover/${filename}`,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadHandler;
