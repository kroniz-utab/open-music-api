const albumRoutes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.createAlbumsHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.editAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
  },
];

module.exports = albumRoutes;
