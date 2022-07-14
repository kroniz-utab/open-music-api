require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const TokenManager = require('./token/TokenManager');

/** Plugin Sources */
const AlbumPlugin = require('./api/plugin/AlbumPlugin');
const SongPlugin = require('./api/plugin/SongPlugin');
const AuthPlugin = require('./api/plugin/AuthPlugin');
const PlaylistPlugin = require('./api/plugin/PlaylistPlugin');
const CollaborationsPlugin = require('./api/plugin/CollaborationsPlugin');

/** Service Sources */
const AuthServices = require('./services/AuthenticationsServices');
const AlbumsServices = require('./services/AlbumServices');
const SongsServices = require('./services/SongServices');
const UsersServices = require('./services/UsersServices');
const PlaylistService = require('./services/PlaylistServices');
const { CollaborationsServices } = require('./services/CollaborationsServices');

/** Validator Sources */
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');
const AuthValidator = require('./validator/auth');
const PlaylistValidator = require('./validator/playlists');
const CollaborationsValidator = require('./validator/collaborations');

const init = async () => {
  const collaborationsService = new CollaborationsServices();
  const albumsService = new AlbumsServices();
  const songsService = new SongsServices();
  const authServices = new AuthServices();
  const usersServices = new UsersServices();
  const playlistServices = new PlaylistService(collaborationsService);

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
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
