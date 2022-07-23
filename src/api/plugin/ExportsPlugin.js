const ExportsHandler = require('../handler/ExportsHandler');
const exportRoutes = require('../routes/ExportsRoutes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { producerService, playlistService, validator }) => {
    const exportsHandler = new ExportsHandler(producerService, playlistService, validator);
    server.route(exportRoutes(exportsHandler));
  },
};
