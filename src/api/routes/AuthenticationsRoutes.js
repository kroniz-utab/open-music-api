const authRoutes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
  },
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.postAuthHandler,
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.putAuthHandler,
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthHandler,
  },
];

module.exports = authRoutes;
