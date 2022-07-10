const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { songsByIdResponseModel, songsListResponseModel } = require('../models/songModel');

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
    const id = `song-${nanoid(10)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'insert into songs values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id',
      values: [
        id,
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

    if (title !== undefined && performer === undefined) {
      const searchResult = result.rows.map(songsListResponseModel)
        .filter((song) => song.title.toLowerCase()
          .includes(title.toLowerCase()));
      return searchResult;
    }

    if (title === undefined && performer !== undefined) {
      const searchResult = result.rows.map(songsListResponseModel)
        .filter((song) => song.performer.toLowerCase()
          .includes(performer.toLowerCase()));
      return searchResult;
    }

    if (performer !== undefined && title !== undefined) {
      const searchResult = result.rows.map(songsListResponseModel)
        .filter((song) => song.performer.toLowerCase().includes(performer.toLowerCase()))
        .filter((song) => song.title.toLowerCase().includes(title.toLowerCase()));
      return searchResult;
    }

    return result.rows.map(songsListResponseModel);
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

    return result.rows.map(songsByIdResponseModel)[0];
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
