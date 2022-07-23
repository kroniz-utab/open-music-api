const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsServices {
  constructor() {
    this.pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `colab-${nanoid(16)}`;

    const query = {
      text: 'insert into collaborations values($1, $2, $3) returning id',
      values: [id, playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'delete from collaborations where playlist_id = $1 and user_id = $2 returning id',
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }
  }

  async verifyCollaboration(playlistId, userId) {
    const query = {
      text: 'select * from collaborations where playlist_id = $1 and user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }

  async verifyRegisteredUserAndPlaylist(userId, playlistId) {
    const userQuery = {
      text: 'select * from users where id = $1',
      values: [userId],
    };

    const userResult = await this.pool.query(userQuery);

    if (!userResult.rows.length) {
      throw new NotFoundError('User tidak ditemukan!');
    }

    const playlistQuery = {
      text: 'select * from playlists where id = $1',
      values: [playlistId],
    };

    const playlistResult = await this.pool.query(playlistQuery);

    if (!playlistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan!');
    }
  }
}

module.exports = { CollaborationsServices };
