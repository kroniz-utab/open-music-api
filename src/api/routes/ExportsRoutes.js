const exportRoutes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{id}',
    handler: handler.postExportPlaylistByIdHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = exportRoutes;
