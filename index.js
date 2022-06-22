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

mongoClient.connect().then(() => {
  db = mongoClient.db("bate-papo-uol");
});

app.post("/participants", (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string") {
    res.sendStatus(422);
    return;
  }

  const promise = db.collection("participants").findOne({ name });

  promise.then((user) => {
    if (user) {
      res.sendStatus(409);
      return;
    }
    saveUser(name, db);
    res.sendStatus(201);
  });
});

app.get("/participants", (req, res) => {
  const promise = db.collection("participants").find().toArray();
  promise.then((participants) => {
    res.send(participants);
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
