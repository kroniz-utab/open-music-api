require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const TokenManager = require('./token/TokenManager');

/** Plugin Sources */
const AlbumPlugin = require('./api/plugin/AlbumPlugin');
const SongPlugin = require('./api/plugin/SongPlugin');
const AuthPlugin = require('./api/plugin/AuthPlugin');

/** Service Sources */
const AuthServices = require('./services/AuthenticationsServices');
const AlbumsServices = require('./services/AlbumServices');
const SongsServices = require('./services/SongServices');
const UsersServices = require('./services/UsersServices');

/** Validator Sources */
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');
const AuthValidator = require('./validator/auth');

const init = async () => {
  const albumsService = new AlbumsServices();
  const songsService = new SongsServices();
  const authServices = new AuthServices();
  const usersServices = new UsersServices();

  const server = Hapi.Server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    /** Register Album plugin */
    {
      plugin: AlbumPlugin,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    /** Register Song plugin */
    {
      plugin: SongPlugin,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    /** Register Authentication Plugin */
    {
      plugin: AuthPlugin,
      options: {
        authServices,
        usersServices,
        tokenManager: TokenManager,
        userValidator: UsersValidator,
        authValidator: AuthValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
