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
const UploadsValidator = require('./validator/uploads');
const CacheService = require('./services/redis/CacheService');

const cacheService = new CacheService();
const collaborationsService = new CollaborationsServices();
const albumsService = new AlbumsServices(cacheService);
const songsService = new SongsServices();
const authServices = new AuthServices();
const usersServices = new UsersServices();
const playlistServices = new PlaylistService(collaborationsService);
const storageService = new StorageService(path.resolve(__dirname, 'api/static/uploads/covers'));

module.exports = [
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
];
