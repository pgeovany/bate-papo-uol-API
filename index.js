import express, { json } from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

import saveUser from "./utils/saveUser.js";

dotenv.config();

const app = express();
app.use([cors(), json()]);

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

async function getDataBase() {
  await mongoClient.connect();
  db = mongoClient.db("bate-papo-uol");
}

getDataBase();

app.post("/participants", async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string") {
    res.sendStatus(422);
    return;
  }

  const user = await db.collection("participants").findOne({ name });
  if (user) {
    res.sendStatus(409);
    return;
  }
  saveUser(name, db);
  res.sendStatus(201);
});

app.get("/participants", async (req, res) => {
  const participants = await db.collection("participants").find().toArray();
  res.send(participants);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
