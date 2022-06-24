import express, { json } from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

import { userSchema, messageSchema } from "./utils/joiSchemas.js";
import saveUser from "./utils/saveUser.js";
import saveMessage from "./utils/saveMessage.js";

dotenv.config();

const app = express();
app.use([cors(), json()]);

const mongoClient = new MongoClient(process.env.MONGO_URI);
await mongoClient.connect();
const db = mongoClient.db("bate-papo-uol");

app.post("/participants", async (req, res) => {
  const name = req.body;

  try {
    await userSchema.validateAsync(name);
  } catch (error) {
    res.sendStatus(422);
    return;
  }

  try {
    const user = await db.collection("participants").findOne({ name });
    if (user) {
      res.sendStatus(409);
      return;
    }
    saveUser(name, db);
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send("Erro ao se conectar ao chat!");
  }
});

app.get("/participants", async (req, res) => {
  try {
    const participants = await db.collection("participants").find().toArray();
    res.send(participants);
  } catch (error) {
    res.status(500).send("Erro ao carregar a lista de participantes!");
  }
});

app.post("/messages", async (req, res) => {
  const { user } = req.headers;
  const message = {
    ...req.body,
    from: user,
  };

  try {
    await messageSchema.validateAsync(message);
  } catch (error) {
    res.sendStatus(422);
    return;
  }

  saveMessage(message, db);
  res.sendStatus(201);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
