function getUserByName(name, db) {
  return db.collection("participants").findOne({ name });
}

export default getUserByName;
