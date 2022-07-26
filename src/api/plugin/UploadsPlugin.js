const UploadHandler = require('../handler/UploadHandler');
const uploadsRoutes = require('../routes/UploadRoutes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, {
    albumsService,
    storageService,
    validator,
  }) => {
    const uploadsHandler = new UploadHandler(albumsService, storageService, validator);
    server.route(uploadsRoutes(uploadsHandler));
  },
};
