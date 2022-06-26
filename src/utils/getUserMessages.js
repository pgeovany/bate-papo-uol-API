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

export default getUserMessages;
