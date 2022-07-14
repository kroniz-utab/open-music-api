const CollaborationsHandler = require('../handler/CollaborationHandler');
const collaborationsRoutes = require('../routes/CollaborationsRoutes');

module.exports = {
  name: 'collaborations',
  register: async (server, {
    collaborationsService,
    playlistsService,
    validator,
  }) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationsService,
      playlistsService,
      validator,
    );

    server.route(collaborationsRoutes(collaborationsHandler));
  },
};
