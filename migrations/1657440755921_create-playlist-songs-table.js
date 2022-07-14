/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: { type: 'VARCHAR(50)', notNull: true },
    song_id: { type: 'VARCHAR(50)', notNull: true },
  });

  pgm.addConstraint(
    'playlist_songs',
    'fk_playlist_songs.song_id_songs.id',
    'foreign key(song_id) references songs(id) on delete cascade',
  );

  pgm.addConstraint(
    'playlist_songs',
    'fk_playlist_songs.playlist_id_playlists.id',
    'foreign key(playlist_id) references playlists(id) on delete cascade',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
};
