async function deleteMessage(_id, db) {
  db.collection("messages").deleteOne({ _id });
}

export default deleteMessage;
