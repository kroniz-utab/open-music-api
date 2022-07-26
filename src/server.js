require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const TokenManager = require('./token/TokenManager');

/** Plugin Sources */
const AlbumPlugin = require('./api/plugin/AlbumPlugin');
const SongPlugin = require('./api/plugin/SongPlugin');
const AuthPlugin = require('./api/plugin/AuthPlugin');
const PlaylistPlugin = require('./api/plugin/PlaylistPlugin');
const CollaborationsPlugin = require('./api/plugin/CollaborationsPlugin');
const ExportsPlugin = require('./api/plugin/ExportsPlugin');
const UploadsPlugin = require('./api/plugin/UploadsPlugin');

/** Service Sources */
const AuthServices = require('./services/databases/AuthenticationsServices');
const AlbumsServices = require('./services/databases/AlbumServices');
const SongsServices = require('./services/databases/SongServices');
const UsersServices = require('./services/databases/UsersServices');
const PlaylistService = require('./services/databases/PlaylistServices');
const { CollaborationsServices } = require('./services/databases/CollaborationsServices');
const ProducerService = require('./services/rabbitmq/ProducerService');
const StorageService = require('./services/storages/StorageService');

/** Validator Sources */
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');
const AuthValidator = require('./validator/auth');
const PlaylistValidator = require('./validator/playlists');
const CollaborationsValidator = require('./validator/collaborations');
const ExportsValidator = require('./validator/exports');
const ClientError = require('./exceptions/ClientError');
const UploadsValidator = require('./validator/uploads');

const init = async () => {
  const collaborationsService = new CollaborationsServices();
  const albumsService = new AlbumsServices();
  const songsService = new SongsServices();
  const authServices = new AuthServices();
  const usersServices = new UsersServices();
  const playlistServices = new PlaylistService(collaborationsService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/static/uploads/covers'));

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
    {
      plugin: Inert,
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
    /** Register playlist plugin */
    {
      plugin: PlaylistPlugin,
      options: {
        service: playlistServices,
        validator: PlaylistValidator,
      },
    },
    /** Register collaborations plugin */
    {
      plugin: CollaborationsPlugin,
      options: {
        collaborationsService,
        playlistsService: playlistServices,
        validator: CollaborationsValidator,
      },
    },
    /** Register exports plugin */
    {
      plugin: ExportsPlugin,
      options: {
        producerService: ProducerService,
        playlistService: playlistServices,
        validator: ExportsValidator,
      },
    },
    /** Register uploads plugin */
    {
      plugin: UploadsPlugin,
      options: {
        albumsService,
        storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof ClientError) {
      const serverResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      serverResponse.code(response.statusCode);
      return serverResponse;
    }
    if (response instanceof Error) {
      const { statusCode, payload } = response.output;
      if (statusCode !== 500) {
        return h.response(payload).code(statusCode);
      }
      const serverResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      serverResponse.code(500);
      console.error(response);
      return serverResponse;
    }
    return response.continue || response;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
