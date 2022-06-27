import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";

import sanitizeString from "./utils/sanitizeString.js";
import mapInactiveUsers from "./utils/mapInactiveUsers.js";
import { userSchema, messageSchema } from "./utils/schemas.js";
import { getDataBase, closeDataBase } from "./utils/dataBaseFunctions.js";
import {
  saveUser,
  getUserByName,
  updateUserStatus,
} from "./utils/usersFunctions.js";
import {
  saveMessage,
  getMessageById,
  getUserMessages,
  deleteMessage,
  editMessage,
} from "./utils/messagesFunctions.js";

dotenv.config();

const OK = 200;
const CREATED = 201;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const CONFLICT = 409;
const UNPROCESSABLE_ENTITY = 422;
const INTERNAL_SERVER_ERROR = 500;

const app = express();
app.use([cors(), json()]);

mapInactiveUsers();

// participants routes
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

// messages routes
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

app.delete("/messages/:id", async (req, res) => {
  const { id } = req.params;
  const { user } = req.headers;

  try {
    const db = getDataBase();
    const message = await getMessageById(id, db);

    if (!message) {
      res.sendStatus(NOT_FOUND);
      closeDataBase();
      return;
    }
    if (message.from !== user) {
      res.sendStatus(UNAUTHORIZED);
      closeDataBase();
      return;
    }
    await deleteMessage(message._id, db);
    res.sendStatus(OK);
  } catch (error) {
    res.sendStatus(INTERNAL_SERVER_ERROR);
  }
});

app.put("/messages/:id", async (req, res) => {
  const { id } = req.params;
  let { user: from } = req.headers;
  let { to, text, type } = req.body;

  try {
    from = sanitizeString(from);
    to = sanitizeString(to);
    text = sanitizeString(text);
    type = sanitizeString(type);

    await messageSchema.validateAsync({
      from,
      to,
      text,
      type,
    });
  } catch (error) {
    res.sendStatus(UNPROCESSABLE_ENTITY);
    closeDataBase();
    return;
  }

  try {
    const db = getDataBase();
    const message = await getMessageById(id, db);

    if (!message) {
      res.sendStatus(NOT_FOUND);
      closeDataBase();
      return;
    }
    if (message.from !== from) {
      res.sendStatus(UNAUTHORIZED);
      closeDataBase();
      return;
    }
    await editMessage(to, text, type, message._id, db);
    res.sendStatus(OK);
  } catch (error) {
    res.sendStatus(INTERNAL_SERVER_ERROR);
    closeDataBase();
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
