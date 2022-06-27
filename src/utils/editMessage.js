import dayjs from "dayjs";

async function editMessage(to, text, type, _id, db) {
  const time = dayjs().format("HH:mm:s");
  db.collection("messages").updateOne(
    { _id },
    { $set: { to, text, type, time } }
  );
}

export default editMessage;
