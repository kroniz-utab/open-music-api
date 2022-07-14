const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistNamePayloadSchema, PlaylistSongPayloadSchema } = require('./schema');

const PlaylistValidator = {
  validatePlaylistNamePayload: (payload) => {
    const validationResult = PlaylistNamePayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePlaylistSongPayload: (payload) => {
    const validationResult = PlaylistSongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistValidator;
