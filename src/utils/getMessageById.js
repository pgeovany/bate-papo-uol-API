import { ObjectId } from "mongodb";

function getMessageById(id, db) {
  return db.collection("messages").findOne({ _id: new ObjectId(id) });
}

export default getMessageById;
