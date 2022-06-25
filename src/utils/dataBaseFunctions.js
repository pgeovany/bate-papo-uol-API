import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);

function getDataBase() {
  mongoClient.connect();
  return mongoClient.db("bate-papo-uol");
}

function closeDataBase() {
  mongoClient.close();
}

export { getDataBase, closeDataBase };
