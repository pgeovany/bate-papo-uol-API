import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";

import saveUser from "./utils/saveUser.js";
import saveMessage from "./utils/saveMessage.js";
import updateUserStatus from "./utils/updateUserStatus.js";
import getUserByName from "./utils/getUserByName.js";
import mapInactiveUsers from "./utils/mapInactiveUsers.js";
import getUserMessages from "./utils/getUserMessages.js";
import { userSchema, messageSchema } from "./utils/schemas.js";
import { getDataBase, closeDataBase } from "./utils/dataBaseFunctions.js";

dotenv.config();

const app = express();
app.use([cors(), json()]);

mapInactiveUsers();

app.post("/participants", async (req, res) => {
  const { name } = req.body;

  try {
    await userSchema.validateAsync({ name });
  } catch (error) {
    res.sendStatus(422);
    return;
  }

  try {
    const db = getDataBase();
    const user = await getUserByName(name, db);

    if (user) {
      res.sendStatus(409);
      closeDataBase();
      return;
    }

    saveUser(name, db);
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send("Erro ao se conectar ao chat!");
    closeDataBase();
  }
});

app.get("/participants", async (req, res) => {
  try {
    const db = getDataBase();
    const users = await db.collection("participants").find().toArray();
    res.send(users);
  } catch (error) {
    res.status(500).send("Erro ao carregar a lista de participantes!");
    closeDataBase();
  }
});

app.post("/messages", async (req, res) => {
  const { user: name } = req.headers;

  try {
    const db = getDataBase();
    const user = await getUserByName(name, db);

    if (!user) {
      res.sendStatus(422);
      closeDataBase();
      return;
    }

    await messageSchema.validateAsync({
      ...req.body,
      from: name,
    });

    saveMessage({ ...req.body, from: name }, db);
    res.sendStatus(201);
  } catch (error) {
    res.sendStatus(422);
    closeDataBase();
  }
});

app.get("/messages", async (req, res) => {
  const { limit } = req.query;
  const { user: name } = req.headers;

  try {
    await userSchema.validateAsync({ name });

    const db = getDataBase();
    const messages = await getUserMessages(name, db);
    closeDataBase();

    if (limit) {
      res.send(messages.slice(-limit));
    } else {
      res.send(messages);
    }
  } catch (error) {
    res.sendStatus(500);
    closeDataBase();
  }
});

app.post("/status", async (req, res) => {
  const { user: name } = req.headers;

  try {
    const db = getDataBase();
    const user = await getUserByName(name, db);

    if (!user) {
      res.sendStatus(404);
      closeDataBase();
      return;
    }

    updateUserStatus(user, db);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(422);
    closeDataBase();
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
