import joi from "joi";

const userSchema = joi.object({
  name: joi.string().trim().required(),
});

const messageSchema = joi.object({
  to: joi.string().trim().required(),
  text: joi.string().trim().required(),
  type: joi.any().valid("message", "private_message").required(),
  from: joi.string().trim().required(),
});

export { userSchema, messageSchema };
