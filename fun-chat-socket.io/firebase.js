const { initializeApp } = require("firebase/app");
const {
  getDatabase,
  ref,
  child,
  get,
  set,
  onValue,
} = require("firebase/database");

const firebaseConfig = {
  apiKey: "",
  authDomain: "chat-open-ai-ab0d4.firebaseapp.com",
  databaseURL: "",
  projectId: "chat-open-ai-ab0d4",
  storageBucket: "chat-open-ai-ab0d4.appspot.com",
  messagingSenderId: "1003421246868",
  appId: "1:1003421246868:web:408acd599de3b35925db81",
};

let dbRef;
let userMap = {};

const dbPath = () => {
  return process.env.PRODUCTION === 'true' ? 'prod/users/' : 'dev/users/' 
}

const connect = () => {
  initializeDB().then(
    (res) => {
      console.log("Connected to Firebase DB");
      listenForUserUpdates();
    },
    (error) => {
      console.log(error);
    }
  );
};

const listenForUserUpdates = () => {
  const usersRef = ref(getDatabase(), dbPath());
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    userMap = data || {};
  });
};

const getUserMap = () => userMap;

const initializeDB = () => {
  return new Promise((resolve, reject) => {
    try {
      firebaseConfig.apiKey = process.env.FIREBASE_API_KEY;
      firebaseConfig.databaseURL = process.env.FIREBASE_DB_URL;
      const app = initializeApp(firebaseConfig);
      dbRef = ref(getDatabase());
      resolve(dbRef);
    } catch (e) {
      reject("Error initializing Firebase DB", e);
    }
  });
};

const writeUserData = (user) => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      set(ref(db, dbPath() + user.id), user);
      resolve();
    } catch (e) {
      reject("Error registering user!", e);
    }
  });
};

const fetchUsers = () => {
  return new Promise((resolve) => {
    get(child(dbRef, dbPath()))
      .then((snapshot) => {
        resolve(snapshot.exists() ? Object.values(snapshot.val()) : []);
      })
      .catch((error) => {
        console.log("Error occurred while fetching events. Trace-->", error);
        resolve([]);
      });
  });
};

const fetchUser = (userId) => {
  return new Promise((resolve) => {
    get(child(dbRef, `dbPath()${userId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        } else {
          resolve("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
};

const userNameAlreadyExists = async (user) => {
  return new Promise((resolve) => {
    fetchUsers().then((users) => {
      resolve(
        users.find((f) => f.name.toLowerCase() === user.name.toLowerCase())
      );
    });
  });
};

module.exports = {
  connect,
  initializeDB,
  writeUserData,
  fetchUser,
  fetchUsers,
  getUserMap,
  userNameAlreadyExists,
};
