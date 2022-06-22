import dayjs from "dayjs";

function saveUser(name, db) {
  db.collection("participants").insertOne({ name, lastStatus: Date.now() });
  db.collection("messages").insertOne({
    from: name,
    to: "Todos",
    text: "Entra na sala",
    type: "status",
    time: dayjs().format("HH:m:s"),
  });
}

export default saveUser;
