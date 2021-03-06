import dayjs from "dayjs";
import { getDataBase } from "./dataBaseFunctions.js";

const TEN_SECONDS = 10000;
const FIFTEEN_SECONDS = 15000;

function removeInactiveUsers(inactiveUsers, db) {
  inactiveUsers.forEach((user) => {
    const time = dayjs().format("HH:mm:s");
    db.collection("participants").deleteOne({ name: user.name });
    db.collection("messages").insertOne({
      from: user.name,
      to: "Todos",
      text: "sai da sala...",
      type: "status",
      time,
    });
  });
}

function mapInactiveUsers() {
  setInterval(async () => {
    const db = getDataBase();
    const users = await db.collection("participants").find().toArray();
    const inactiveUsers = users.filter(
      (user) => Date.now() - user.lastStatus > TEN_SECONDS
    );
    removeInactiveUsers(inactiveUsers, db);
  }, FIFTEEN_SECONDS);
}

export default mapInactiveUsers;
