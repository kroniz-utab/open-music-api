const { nanoid } = require('nanoid');
const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { albumModel } = require('../models/albumModel');
const { songsListResponseModel } = require('../models/songModel');

class AlbumServices {
  constructor() {
    this.pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(10);
    const prefix = 'album';
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const storeId = prefix.concat('-', id);

    const query = {
      text: 'insert into albums values($1, $2, $3, $4, $5) returning id',
      values: [storeId, name, year, createdAt, updatedAt],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'select * from albums where id = $1',
      values: [id],
    };

    const songsQuery = {
      text: 'select * from songs where album_id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    const songsResult = await this.pool.query(songsQuery);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return result.rows.map(albumModel)
      .map((album) => ({
        id: album.id,
        name: album.name,
        year: album.year,
        songs: songsResult.rows.map(songsListResponseModel),
      }))[0];
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'update albums set name = $1, year=$2, updated_at = $3 where id = $4 returning id',
      values: [name, year, updatedAt, id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbaharui Album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'delete from albums where id = $1 returning id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = { AlbumServices };
