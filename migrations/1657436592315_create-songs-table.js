/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    title: { type: 'TEXT', notNull: true },
    year: { type: 'INT', notNull: true },
    genre: { type: 'TEXT', notNull: true },
    performer: { type: 'TEXT', notNull: true },
    duration: { type: 'INT', notNull: false },
    album_id: { type: 'VARCHAR(50)', notNull: false },
  });

  pgm.addConstraint(
    'songs',
    'fk_songs.album_id_albums.id',
    'foreign key(album_id) references albums(id) on delete cascade',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
