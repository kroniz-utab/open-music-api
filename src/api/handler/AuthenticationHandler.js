const ClientError = require('../../exceptions/ClientError');

class AuthHandler {
  constructor(
    authServices,
    usersServices,
    tokenManager,
    userValidator,
    authValidator,
  ) {
    this.authService = authServices;
    this.usersService = usersServices;
    this.tokenManager = tokenManager;
    this.userValidator = userValidator;
    this.authValidator = authValidator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.postAuthHandler = this.postAuthHandler.bind(this);
    this.putAuthHandler = this.putAuthHandler.bind(this);
    this.deleteAuthHandler = this.deleteAuthHandler.bind(this);
  }

  /** Register User Handler */
  async postUserHandler(request, h) {
    try {
      this.userValidator.validateUserPayload(request.payload);

      const userId = await this.usersService.addUser(request.payload);

      const response = h.response({
        status: 'success',
        message: 'Registrasi berhasil!',
        data: {
          userId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  /** Login User Handler */
  async postAuthHandler(request, h) {
    try {
      this.authValidator.validatePostAuthPayload(request.payload);

      const { username, password } = request.payload;

      const id = await this.usersService.verifyUserCredential(username, password);

      const accessToken = this.tokenManager.generateAccessToken({ id });
      const refreshToken = this.tokenManager.generateRefreshToken({ id });

      await this.authService.addRefreshToken(refreshToken);

      const response = h.response({
        status: 'success',
        message: 'Login berhasil!',
        data: {
          accessToken,
          refreshToken,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  /** Refresh token user Handler */
  async putAuthHandler(request, h) {
    try {
      this.authValidator.validatePutAuthPayload(request.payload);

      const { refreshToken } = request.payload;

      await this.authService.verifyRefreshToken(refreshToken);
      const { id } = this.tokenManager.verifyRefreshToken(refreshToken);

      const accessToken = this.tokenManager.generateAccessToken({ id });

      return {
        status: 'success',
        message: 'Access Token berhasil diperbarui',
        data: {
          accessToken,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  /** Logout User Handler */
  async deleteAuthHandler(request, h) {
    try {
      this.authValidator.validateDeleteAuthPayload(request.payload);

      const { refreshToken } = request.payload;

      await this.authService.verifyRefreshToken(refreshToken);
      await this.authService.deleteRefreshToken(refreshToken);

      return {
        status: 'success',
        message: 'Berhasil logout!',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = AuthHandler;
