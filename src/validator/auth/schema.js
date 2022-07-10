const Joi = require('joi');

const PostAuthPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const RefreshTokenPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  PostAuthPayloadSchema,
  RefreshTokenPayloadSchema,
};
