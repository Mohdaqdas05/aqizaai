const Joi = require('joi');

const respond = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const details = error.details.map((d) => d.message);
    return res.status(400).json({ error: details.join('; ') });
  }
  next();
};

const validateRegister = respond(
  Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name:     Joi.string().min(1).max(255).required(),
  })
);

const validateLogin = respond(
  Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
  })
);

const validateChat = respond(
  Joi.object({
    message: Joi.string().min(1).required(),
    model:   Joi.string().optional(),
  })
);

module.exports = { validateRegister, validateLogin, validateChat };
