const InvariantError = require('../../exceptions/InvariantError');
const { PostAuthPayloadSchema, RefreshTokenPayloadSchema } = require('./schema');

const AuthValidator = {
  validatePostAuthPayload: (payload) => {
    const validationResult = PostAuthPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutAuthPayload: (payload) => {
    const validationResult = RefreshTokenPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeleteAuthPayload: (payload) => {
    const validationResult = RefreshTokenPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AuthValidator;
