import dayjs from "dayjs";

function saveMessage({ from, to, text, type }, db) {
  const time = dayjs().format("HH:m:s");
  db.collection("messages").insertOne({
    from: from.name,
    to,
    text,
    type,
    time,
  });
}

export default saveMessage;
