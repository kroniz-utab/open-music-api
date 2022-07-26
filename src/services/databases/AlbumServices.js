const { nanoid } = require('nanoid');
const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { albumModel } = require('../../models/albumModel');
const { songsListResponseModel } = require('../../models/songModel');

class AlbumsServices {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(10)}`;

    const query = {
      text: 'insert into albums values($1, $2, $3) returning id',
      values: [id, name, year],
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
        coverUrl: album.cover === null
          ? null
          : `http://${process.env.HOST}:${process.env.PORT}/covers/${album.cover}`,
        songs: songsResult.rows.map(songsListResponseModel),
      }))[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'update albums set name = $1, year=$2 where id = $3 returning id',
      values: [name, year, id],
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

  async editAlbumCoverById(id, albumFilename) {
    const query = {
      text: 'update albums set cover = $1 where id = $2 returning id',
      values: [albumFilename, id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menambahkan cover album. Id tidak ditemukan');
    }
  }

  async likeAlbumById({ userId, albumId }) {
    const id = `likes-${nanoid(10)}`;

    const query = {
      text: 'insert into user_album_likes values($1, $2, $3) returning id',
      values: [id, userId, albumId],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal disukai');
    }

    await this.cacheService.delete(`likes:${albumId}`);
  }

  async unlikeAlbumById({ userId, albumId }) {
    const query = {
      text: 'delete from user_album_likes where user_id = $1 and album_id = $2 returning id',
      values: [userId, albumId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Album yang anda sukai gagal dihapus');
    }

    await this.cacheService.delete(`likes:${albumId}`);
  }

  async getTotalLikesAlbum(albumId) {
    try {
      const likes = await this.cacheService.get(`likes:${albumId}`);
      return {
        likes: JSON.parse(likes),
        source: 'cache',
      };
    } catch {
      const query = {
        text: 'select cast(count(*) as int) as likes from user_album_likes where album_id = $1',
        values: [albumId],
      };

      const result = await this.pool.query(query);

      if (!result.rows[0].likes) {
        throw new InvariantError('Gagal mengambil data album likes');
      }

      await this.cacheService.set(`likes:${albumId}`, JSON.stringify(result.rows[0].likes));

      return {
        likes: result.rows[0].likes,
        source: 'postgres',
      };
    }
  }

  async verifyAvailabilityAlbums(albumId) {
    const query = {
      text: 'select * from albums where id = $1',
      values: [albumId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan!');
    }
  }

  async isAlbumLikedByUser(userId, albumId) {
    const query = {
      text: 'select cast(count(*) as int) as likes from user_album_likes where user_id = $1 and album_id = $2',
      values: [userId, albumId],
    };

    const result = await this.pool.query(query);
    const isLiked = result.rows[0].likes !== 0;

    return isLiked;
  }
}

module.exports = AlbumsServices;
