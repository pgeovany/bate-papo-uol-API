import joi from "joi";

const userSchema = joi.object({
  name: joi.string().required(),
});

const messageSchema = joi.object({
  to: joi.string().required(),
  text: joi.string().required(),
  type: joi.any().valid("message", "private_message").required(),
  from: joi.string().required(),
});

export { userSchema, messageSchema };
