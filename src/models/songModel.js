/* eslint-disable camelcase */

const songModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

const songsByIdResponseModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

const songsListResponseModel = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

module.exports = { songModel, songsByIdResponseModel, songsListResponseModel };
