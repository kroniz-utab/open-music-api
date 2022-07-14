/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlist_song_activities', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: { type: 'VARCHAR(50)', notNull: true },
    song_id: { type: 'VARCHAR(50)', notNull: true },
    user_id: { type: 'VARCHAR(50)', notNull: true },
    action: { type: 'VARCHAR(50)', notNull: true },
    time: { type: 'VARCHAR(50)', notNull: true },
  });

  pgm.addConstraint(
    'playlist_song_activities',
    'fk_playlist_song_activities.playlist_id_playlists.id',
    'foreign key(playlist_id) references playlists(id) on delete cascade',
  );

  pgm.addConstraint(
    'playlist_song_activities',
    'fk_playlist_song_activities.user_id_users.id',
    'foreign key(user_id) references users(id) on delete cascade',
  );

  pgm.addConstraint(
    'playlist_song_activities',
    'fk_playlist_song_activities.song_id_songs.id',
    'foreign key(song_id) references songs(id) on delete cascade',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_song_activities');
};
