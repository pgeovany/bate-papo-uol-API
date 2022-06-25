async function updateUserStatus(user, db) {
  await db
    .collection("participants")
    .updateOne({ name: user.name }, { $set: { lastStatus: Date.now() } });
}

export default updateUserStatus;
