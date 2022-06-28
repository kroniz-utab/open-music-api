const SongsHandler = require('../handler/SongsHandler');
const songRoutes = require('../routes/SongsRoutes');

module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const songHandler = new SongsHandler(service, validator);
    server.route(songRoutes(songHandler));
  },
};
