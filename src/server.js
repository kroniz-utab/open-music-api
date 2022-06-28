require('dotenv').config();

const Hapi = require('@hapi/hapi');
const AlbumPlugin = require('./api/plugin/AlbumPlugin');
const SongPlugin = require('./api/plugin/SongPlugin');
const { AlbumServices } = require('./services/AlbumServices');
const { SongServices } = require('./services/SongServices');
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');

const init = async () => {
  const albumService = new AlbumServices();
  const songService = new SongServices();

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
    /** Register Album plugin */
    {
      plugin: AlbumPlugin,
      options: {
        service: albumService,
        validator: AlbumsValidator,
      },
    },
    /** Register Song plugin */
    {
      plugin: SongPlugin,
      options: {
        service: songService,
        validator: SongsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
