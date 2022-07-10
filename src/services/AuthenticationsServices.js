const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');

class AuthServices {
  constructor() {
    this.pool = new Pool();
  }

  async addRefreshToken(token) {
    const query = {
      text: 'insert into authentications values($1)',
      values: [token],
    };

    await this.pool.query(query);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'select token from authentications where token = $1',
      values: [token],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'delete from authentications where token = $1',
      values: [token],
    };

    await this.pool.query(query);
  }
}

module.exports = AuthServices;
