const PlaylistHandler = require('../handler/PlaylistHandler');
const playlistRoutes = require('../routes/PlaylistsRoutes');

module.exports = {
  name: 'playlist',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const playlistHandler = new PlaylistHandler(service, validator);
    server.route(playlistRoutes(playlistHandler));
  },
};
