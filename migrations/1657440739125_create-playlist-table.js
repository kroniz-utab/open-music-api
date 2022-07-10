/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name: { type: 'VARCHAR(150)', notNull: true },
    owner: { type: 'VARCHAR(50)', notNull: true },
  });

  pgm.addConstraint(
    'playlists',
    'fk_playlists.owner_users.id',
    'foreign key(owner) references users(id) on delete cascade',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlists');
};
