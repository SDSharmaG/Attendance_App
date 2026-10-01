import { openDB } from "idb";

const DB_NAME = "attendanceDB";
const DB_VERSION = 1;
const STORE_NAME = "attendance";

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      const store = database.createObjectStore(STORE_NAME, {
        keyPath: "id",
      });

      store.createIndex("date", "date");
    }
  },
});

export async function getAllAttendance() {
  const database = await dbPromise;
  return database.getAll(STORE_NAME);
}

export async function addAttendance(record) {
  const database = await dbPromise;
  await database.put(STORE_NAME, record);
}

export async function updateAttendance(record) {
  const database = await dbPromise;
  await database.put(STORE_NAME, record);
}

export async function deleteAttendance(id) {
  const database = await dbPromise;
  await database.delete(STORE_NAME, id);
}

export async function clearAttendance() {
  const database = await dbPromise;
  await database.clear(STORE_NAME);
}
