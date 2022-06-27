import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";

import saveUser from "./utils/saveUser.js";
import saveMessage from "./utils/saveMessage.js";
import updateUserStatus from "./utils/updateUserStatus.js";
import getUserByName from "./utils/getUserByName.js";
import getUserMessages from "./utils/getUserMessages.js";
import mapInactiveUsers from "./utils/mapInactiveUsers.js";
import sanitizeString from "./utils/sanitizeString.js";
import { userSchema, messageSchema } from "./utils/schemas.js";
import { getDataBase, closeDataBase } from "./utils/dataBaseFunctions.js";

dotenv.config();

const OK = 200;
const CREATED = 201;
const NOT_FOUND = 404;
const CONFLICT = 409;
const UNPROCESSABLE_ENTITY = 422;
const INTERNAL_SERVER_ERROR = 500;

const app = express();
app.use([cors(), json()]);

mapInactiveUsers();

app.post("/participants", async (req, res) => {
  let { name } = req.body;

  try {
    name = sanitizeString(name);
    await userSchema.validateAsync({ name });
  } catch (error) {
    res.sendStatus(UNPROCESSABLE_ENTITY);
    closeDataBase();
    return;
  }

  try {
    const db = getDataBase();
    const user = await getUserByName(name, db);

    if (user) {
      res.sendStatus(CONFLICT);
      closeDataBase();
      return;
    }

    saveUser(name, db);
    res.sendStatus(CREATED);
  } catch (error) {
    res.sendStatus(INTERNAL_SERVER_ERROR);
    closeDataBase();
  }
});

app.get("/participants", async (req, res) => {
  try {
    const db = getDataBase();
    const users = await db.collection("participants").find().toArray();
    res.send(users);
  } catch (error) {
    res.sendStatus(INTERNAL_SERVER_ERROR);
    closeDataBase();
  }
});

app.post("/messages", async (req, res) => {
  let { user: from } = req.headers;
  let { to, text, type } = req.body;

  try {
    from = sanitizeString(from);
    to = sanitizeString(to);
    text = sanitizeString(text);
    type = sanitizeString(type);

    const db = getDataBase();
    const user = await getUserByName(from, db);

    if (!user) {
      res.sendStatus(UNPROCESSABLE_ENTITY);
      closeDataBase();
      return;
    }

    await messageSchema.validateAsync({
      from,
      to,
      text,
      type,
    });

    saveMessage(from, to, text, type, db);
    res.sendStatus(CREATED);
  } catch (error) {
    res.sendStatus(UNPROCESSABLE_ENTITY);
    closeDataBase();
  }
});

app.get("/messages", async (req, res) => {
  const { limit } = req.query;
  const { user: name } = req.headers;

  try {
    const db = getDataBase();
    const messages = await getUserMessages(name, db);

    if (limit) {
      res.send(messages.slice(-limit));
    } else {
      res.send(messages);
    }
  } catch (error) {
    res.sendStatus(INTERNAL_SERVER_ERROR);
    closeDataBase();
  }
});

app.post("/status", async (req, res) => {
  const { user: name } = req.headers;

  try {
    const db = getDataBase();
    const user = await getUserByName(name, db);

    if (!user) {
      res.sendStatus(NOT_FOUND);
      closeDataBase();
      return;
    }

    updateUserStatus(user, db);
    res.sendStatus(OK);
  } catch (error) {
    res.sendStatus(UNPROCESSABLE_ENTITY);
    closeDataBase();
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
