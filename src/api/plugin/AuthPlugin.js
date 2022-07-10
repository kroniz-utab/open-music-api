const AuthHandler = require('../handler/AuthenticationHandler');
const authRoutes = require('../routes/AuthenticationsRoutes');

module.exports = {
  name: 'auths',
  version: '1.0.0',
  register: async (server, {
    authServices,
    usersServices,
    tokenManager,
    userValidator,
    authValidator,
  }) => {
    const authHandler = new AuthHandler(
      authServices,
      usersServices,
      tokenManager,
      userValidator,
      authValidator,
    );
    server.route(authRoutes(authHandler));
  },
};
