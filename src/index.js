import express, { json } from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import saveUser from "./utils/saveUser.js";
import saveMessage from "./utils/saveMessage.js";
import { userSchema, messageSchema } from "./utils/Schemas.js";

dotenv.config();

const app = express();
app.use([cors(), json()]);

const mongoClient = new MongoClient(process.env.MONGO_URI);

function getDataBase() {
  mongoClient.connect();
  return mongoClient.db("bate-papo-uol");
}

function closeDataBase() {
  mongoClient.close();
}

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
    const user = await db.collection("participants").findOne({ name });
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
    const participants = await db.collection("participants").find().toArray();
    res.send(participants);
  } catch (error) {
    res.status(500).send("Erro ao carregar a lista de participantes!");
    closeDataBase();
  }
});

app.post("/messages", async (req, res) => {
  const { user } = req.headers;

  try {
    const db = getDataBase();
    const userExists = await db
      .collection("participants")
      .findOne({ name: user });

    if (!userExists) {
      res.sendStatus(422);
      closeDataBase();
      return;
    }

    await messageSchema.validateAsync({
      ...req.body,
      from: user,
    });

    saveMessage({ ...req.body, from: user }, db);
    res.sendStatus(201);
  } catch (error) {
    res.sendStatus(422);
    closeDataBase();
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
