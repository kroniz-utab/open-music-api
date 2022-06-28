const AlbumsHandler = require('../handler/AlbumHandler');
const albumRoutes = require('../routes/AlbumsRoutes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const albumHandler = new AlbumsHandler(service, validator);
    server.route(albumRoutes(albumHandler));
  },
};
