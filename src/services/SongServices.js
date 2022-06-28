const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { songModel } = require('../models/songModel');

class SongServices {
  constructor() {
    this.pool = new Pool();
  }

  async addSong({
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const id = nanoid(10);
    const prefix = 'song';
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const storeId = prefix.concat('-', id);

    const query = {
      text: 'insert into songs values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id',
      values: [
        storeId,
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        createdAt,
        updatedAt,
      ],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    const result = await this.pool.query('select * from songs');

    /** When title query is defined and performer query is undefined */
    if (title !== undefined && performer === undefined) {
      const searchResult = result.rows.map(songModel)
        .filter((song) => song.title.toLowerCase()
          .includes(title.toLowerCase()))
        .map((song) => ({
          id: song.id,
          title: song.title,
          performer: song.performer,
        }));
      return searchResult;
    }

    /** When title query is undefined and performer query is defined */
    if (title === undefined && performer !== undefined) {
      const searchResult = result.rows.map(songModel)
        .filter((song) => song.performer.toLowerCase()
          .includes(performer.toLowerCase()))
        .map((song) => ({
          id: song.id,
          title: song.title,
          performer: song.performer,
        }));
      return searchResult;
    }

    /** When title query is defined and performer query is defined */
    if (performer !== undefined && title !== undefined) {
      const searchResult = result.rows.map(songModel)
        .filter((song) => song.performer.toLowerCase().includes(performer.toLowerCase()))
        .filter((song) => song.title.toLowerCase().includes(title.toLowerCase()))
        .map((song) => ({
          id: song.id,
          title: song.title,
          performer: song.performer,
        }));
      return searchResult;
    }

    /** When query is undefined */
    return result.rows.map(songModel)
      .map((song) => ({
        id: song.id,
        title: song.title,
        performer: song.performer,
      }));
  }

  async getSongById(id) {
    const query = {
      text: 'select * from songs where id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(songModel)
      .map((song) => ({
        id: song.id,
        title: song.title,
        year: song.year,
        performer: song.performer,
        genre: song.genre,
        duration: song.duration,
        albumId: song.albumId,
      }))[0];
  }

  async editSongById(id, {
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'update songs set title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 where id = $8 returning id',
      values: [
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        updatedAt,
        id,
      ],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui Lagu. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'delete from songs where id = $1 returning id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = { SongServices };
