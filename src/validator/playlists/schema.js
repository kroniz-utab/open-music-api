const Joi = require('joi');

const PlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const PlaylistNamePayloadSchema = Joi.object({
  name: Joi.string().required(),
});

module.exports = {
  PlaylistSongPayloadSchema,
  PlaylistNamePayloadSchema,
};
