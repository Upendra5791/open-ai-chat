const { initializeApp } = require("firebase/app");
const {
  getDatabase,
  ref,
  child,
  get,
  set,
  onValue,
} = require("firebase/database");
const { uid } = require("uid/secure");

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

const userDBpath =
  process.env.PRODUCTION === "true" ? "prod/users/" : "dev/users/";
const messageDBpath =
  process.env.PRODUCTION === "true" ? "prod/messages/" : "dev/messages/";
  const threadDBpath =
  process.env.PRODUCTION === "true" ? "prod/threads/" : "dev/threads/";

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
  const usersRef = ref(getDatabase(), userDBpath);
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
      set(ref(db, userDBpath + user.id), user);
      resolve();
    } catch (e) {
      reject("Error registering user!", e);
    }
  });
};

const fetchUsers = () => {
  return new Promise((resolve) => {
    get(child(dbRef, userDBpath))
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
    get(child(dbRef, `userDBpath${userId}`))
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

const addMessage = (userId, message) => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      set(ref(db, `${messageDBpath}/${userId}/${message.id}`), message);
      resolve();
    } catch (e) {
      reject("Error adding message!", e);
    }
  });
};

const removeMessage = (userId, message) => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      set(ref(db, `${messageDBpath}/${userId}/${message.id}`), null);
      resolve();
    } catch (e) {
      reject("Error removing message!", e);
    }
  });
};

const getMessages = (userId) => {
  return new Promise((resolve, reject) => {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `${messageDBpath}/${userId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        } else {
          resolve([]);
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};

const createThread = (messages) => {
  return new Promise(async (resolve, reject) => {
    try {
      const threadId = `thread_${uid(16)}`;
      const db = getDatabase();
      await set(ref(db, `${threadDBpath}/${threadId}`), messages);
      resolve(threadId);
    } catch (e) {
      reject("Error adding message!", e);
    }
  });
};

const getThreadMessages = (threadId) => {
  return new Promise((resolve, reject) => {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `${threadDBpath}/${threadId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        } else {
          resolve([]);
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};

const addMessageToThread = ({threadId, messages}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = getDatabase();
      await set(ref(db, `${threadDBpath}/${threadId}`), messages);
      resolve(threadId);
    } catch (e) {
      reject("Error adding message!", e);
    }
  });
};


module.exports = {
  connect,
  writeUserData,
  fetchUser,
  fetchUsers,
  getUserMap,
  userNameAlreadyExists,
  addMessage,
  removeMessage,
  getMessages,
  createThread,
  getThreadMessages,
  addMessageToThread
};
