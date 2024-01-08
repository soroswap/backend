import * as Joi from 'joi';

export const envSchema = Joi.object({
  API_KEY: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
});
