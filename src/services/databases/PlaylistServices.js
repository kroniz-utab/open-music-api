const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { playlistModel, playlistActivitiesModel } = require('../../models/playlistModel');
const { songsListResponseModel } = require('../../models/songModel');

class PlaylistService {
  constructor(collaborationsService) {
    this.pool = new Pool();
    this.collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'insert into playlists values ($1, $2, $3) returning id',
      values: [id, name, owner],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getMyPlaylist(owner) {
    const query = {
      text: `select playlists.*, users.username from playlists
      inner join users on users.id = playlists.owner
      left join collaborations on collaborations.playlist_id = playlists.id
      where playlists.owner = $1 or collaborations.user_id = $1`,
      values: [owner],
    };

    const result = await this.pool.query(query);
    return result.rows.map(playlistModel);
  }

  async deleteMyPlaylistById(id) {
    const query = {
      text: 'delete from playlists where id = $1 returning id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylist({ id, songId }) {
    const playlistInputId = `plsong-${nanoid(16)}`;
    const query = {
      text: 'insert into playlist_songs values($1, $2, $3) returning id',
      values: [playlistInputId, id, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagumu gagal ditambakan ke playlist!');
    }

    return result.rows[0].id;
  }

  async getSongPlaylist(id) {
    const playlistQuery = {
      text: `select playlists.*, users.username from playlists
      inner join users on users.id = playlists.owner
      where playlists.id = $1`,
      values: [id],
    };

    const playlistSongsQuery = {
      text: `select songs.* from songs inner join playlist_songs
      on playlist_songs.song_id = songs.id
      where playlist_songs.playlist_id = $1`,
      values: [id],
    };

    const playlistInfoResult = await this.pool.query(playlistQuery);
    const playlistSongsResult = await this.pool.query(playlistSongsQuery);

    return playlistInfoResult.rows.map(playlistModel)
      .map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        username: playlist.username,
        songs: playlistSongsResult.rows.map(songsListResponseModel),
      }))[0];
  }

  async deleteSongOnPlaylist(id, songId) {
    const query = {
      text: 'delete from playlist_songs where playlist_id = $1 and song_id = $2 returning id',
      values: [id, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu dalam playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'select * from playlists where id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses Playlist ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this.collaborationsService.verifyCollaboration(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async verifyPlaylistSongs(id, songId) {
    const query = {
      text: 'select * from playlist_songs where playlist_id = $1 and song_id = $2',
      values: [id, songId],
    };

    const result = await this.pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan lagu, Lagu sudah tersedia dalam playlist');
    }
  }

  async verifyAvailabilitySong(songId) {
    const query = {
      text: 'select * from songs where id = $1',
      values: [songId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan!');
    }
  }

  async addPlaylistActivities({
    playlistId,
    songId,
    userId,
    action,
  }) {
    const id = `activities-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: `insert into playlist_song_activities
      values ($1, $2, $3, $4, $5, $6) returning id`,
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Activities gagal direkam');
    }

    return result.rows[0].id;
  }

  async getPlaylistActivitiesById(id) {
    const query = {
      text: `select playlist_song_activities.*, users.username, songs.title from playlist_song_activities
      inner join users on users.id = playlist_song_activities.user_id
      inner join songs on songs.id = playlist_song_activities.song_id
      where playlist_song_activities.playlist_id = $1`,
      values: [id],
    };

    const result = await this.pool.query(query);

    return result.rows.map(playlistActivitiesModel);
  }
}

module.exports = PlaylistService;
