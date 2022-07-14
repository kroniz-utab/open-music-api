/* eslint-disable camelcase */

const playlistModel = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username,
});

const playlistActivitiesModel = ({
  username,
  title,
  action,
  time,
}) => ({
  username,
  title,
  action,
  time,
});

module.exports = { playlistModel, playlistActivitiesModel };
