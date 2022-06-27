import dayjs from "dayjs";

function saveUser(name, db) {
  const time = dayjs().format("HH:mm:s");

  db.collection("participants").insertOne({ name, lastStatus: Date.now() });

  db.collection("messages").insertOne({
    from: name,
    to: "Todos",
    text: "Entra na sala",
    type: "status",
    time,
  });
}

function getUserByName(name, db) {
  return db.collection("participants").findOne({ name });
}

async function updateUserStatus(user, db) {
  await db
    .collection("participants")
    .updateOne({ name: user.name }, { $set: { lastStatus: Date.now() } });
}

export { saveUser, getUserByName, updateUserStatus };
