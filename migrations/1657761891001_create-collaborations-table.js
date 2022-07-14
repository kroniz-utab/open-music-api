/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: { type: 'VARCHAR(50)', primarykey: true },
    playlist_id: { type: 'VARCHAR(50)', notNull: true },
    user_id: { type: 'VARCHAR(50)', notNull: true },
  });

  pgm.addConstraint(
    'collaborations',
    'fk_collaborations.user_id_users.id',
    'foreign key(user_id) references users(id) on delete cascade',
  );

  pgm.addConstraint(
    'collaborations',
    'fk_collaborations.playlist_id_playlists.id',
    'foreign key(playlist_id) references playlists(id) on delete cascade',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};
