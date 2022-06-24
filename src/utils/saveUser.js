import dayjs from "dayjs";

function saveUser(name, db) {
  const time = dayjs().format("HH:m:s");

  db.collection("participants").insertOne({ name, lastStatus: Date.now() });

  db.collection("messages").insertOne({
    from: name,
    to: "Todos",
    text: "Entra na sala",
    type: "status",
    time,
  });
}

export default saveUser;
