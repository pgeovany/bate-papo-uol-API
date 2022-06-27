import dayjs from "dayjs";
import { ObjectId } from "mongodb";

function saveMessage(from, to, text, type, db) {
  const time = dayjs().format("HH:mm:s");
  db.collection("messages").insertOne({
    from,
    to,
    text,
    type,
    time,
  });
}

function getMessageById(id, db) {
  return db.collection("messages").findOne({ _id: new ObjectId(id) });
}

async function getUserMessages(name, db) {
  const messages = await db.collection("messages").find().toArray();
  const userMessages = messages.filter(
    (message) =>
      message.from === name ||
      message.to === name ||
      message.to === "Todos" ||
      message.type === "message" ||
      message.type === "status"
  );
  return userMessages;
}

async function deleteMessage(_id, db) {
  db.collection("messages").deleteOne({ _id });
}

async function editMessage(to, text, type, _id, db) {
  const time = dayjs().format("HH:mm:s");
  db.collection("messages").updateOne(
    { _id },
    { $set: { to, text, type, time } }
  );
}

export {
  saveMessage,
  getMessageById,
  getUserMessages,
  deleteMessage,
  editMessage,
};
