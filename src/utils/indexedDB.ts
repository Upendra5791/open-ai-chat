import { Chat, Message } from "../store/ChatsSlice";
import { User } from "../store/UserSlice";

export const initializeChatDB = () => {
    const request = window.indexedDB.open("fun_chat_chats_db", 1);
    request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
      
        // Create another object store called "names" with the autoIncrement flag set as true.
        const objStore = db.createObjectStore("chats", { keyPath: "id"});
      };
}

export const addChatToIndexedDB = (chat: Chat) => {
  return new Promise<void>((resolve, reject) => {

    const request: IDBOpenDBRequest = window.indexedDB.open("fun_chat_chats_db", 1);
    request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(['chats'], 'readwrite');
        const objectStore = transaction.objectStore('chats');
        const addRequest = objectStore.add(chat);
        addRequest.onsuccess = () => {
            resolve();
        };
        addRequest.onerror = (error: any) => {
            reject(error);
        };
    };
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      db.createObjectStore("chats", { keyPath: "id"});
    };
  });
};

export const addMessageToChat = ({
  chat,
  message,
}: {
  chat: Chat;
  message: Message;
}) => {
  return new Promise<void>((resolve, reject) => {
    const request = window.indexedDB.open("fun_chat_chats_db", 1);
    request.onerror = (event: any) => {
      reject(event.target.errorCode);
    };
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(["chats"], "readwrite");
      const objectStore = transaction.objectStore("chats");
      const request = objectStore.get(chat.id);
      request.onsuccess = (event: any) => {
        const data: Chat = event.target.result;
        data.unreadMessageCount = chat.unreadMessageCount;
        data.messages = [...data.messages, message];
        const requestUpdate = objectStore.put(data);
        requestUpdate.onerror = (event: any) => {
          // Do something with the error
        };
        requestUpdate.onsuccess = (event: any) => {
          // Success - the data is updated!
        };
        transaction.oncomplete = () => {
          resolve();
        };
      };
    };
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      db.createObjectStore("chats", { keyPath: "id"});
    };
  });
};

export const resetUnreadMessageCount = (chat: Chat) => {
    return new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open("fun_chat_chats_db", 1);
      request.onerror = (event: any) => {
        reject(event.target.errorCode);
      };
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(["chats"], "readwrite");
        const objectStore = transaction.objectStore("chats");
        const request = objectStore.get(chat.id);
        request.onsuccess = (event: any) => {
          const data: Chat = event.target.result;
          data.unreadMessageCount = 0;
          const requestUpdate = objectStore.put(data);
          requestUpdate.onerror = (event: any) => {
            // Do something with the error
          };
          requestUpdate.onsuccess = (event: any) => {
            // Success - the data is updated!
          };
          transaction.oncomplete = () => {
            resolve();
          };
        };
      };
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        db.createObjectStore("chats", { keyPath: "id"});
      };
    });
  };

export const getChatsFromIndexedDB = () => {
    return new Promise<Chat[]>((resolve, reject) => {
        const request = window.indexedDB.open('fun_chat_chats_db', 1);
        request.onerror = (event: any) => {
            reject(event.target.errorCode);
        };
        request.onsuccess = (event: any) => {
            const db = event.target.result;
            db.transaction("chats")
                .objectStore("chats")
                .getAll().onsuccess = ((event: any) => {
                    console.log(`Name for SSN 444-44-4444 is ${event.target.result}`);
                    resolve(event.target.result);
                });
           /*  const transaction = db.transaction(['chats'], 'readonly');
            const objectStore = transaction.objectStore('chats');
            const getRequest = objectStore.getAll();
            getRequest.onsuccess = () => {
                resolve(getRequest.result);
            };
            getRequest.onerror = (error: any) => {
                reject(error);
            }; */
        };
        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            db.createObjectStore('chats', { keyPath: 'id' });
        };
    });
};

export const getChatFromIndexedDB = (chat: Chat) => {
  return new Promise<Chat[]>((resolve, reject) => {
      const request = window.indexedDB.open('fun_chat_chats_db', 1);
      request.onerror = (event: any) => {
          reject(event.target.errorCode);
      };
      request.onsuccess = (event: any) => {
          const db = event.target.result;
          db.transaction("chats")
              .objectStore("chats")
              .get(chat.id).onsuccess = ((event: any) => {
                  console.log(`Chat is ${event.target.result}`);
                  resolve(event.target.result);
              });
         /*  const transaction = db.transaction(['chats'], 'readonly');
          const objectStore = transaction.objectStore('chats');
          const getRequest = objectStore.getAll();
          getRequest.onsuccess = () => {
              resolve(getRequest.result);
          };
          getRequest.onerror = (error: any) => {
              reject(error);
          }; */
      };
      request.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          db.createObjectStore('chats', { keyPath: 'id' });
      };
  });
};

export const saveUserToIndexedDB = (key: string, value: any) => {
    return new Promise<void>((resolve, reject) => {
        const request = window.indexedDB.open('fun_chat_user_db', 1);
        request.onerror = (event: any) => {
            reject(event.target.errorCode);
        };
        request.onsuccess = (event: any) => {
            const db = event.target.result;
            const transaction = db.transaction(['users'], 'readwrite');
            const objectStore = transaction.objectStore('users');
            const addRequest = objectStore.add(value);
            addRequest.onsuccess = () => {
                resolve();
            };
            addRequest.onerror = (error: any) => {
                reject(error);
            };
        };
        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            const objectStore = db.createObjectStore('users', { keyPath: 'name' });
        };
    });
};

export const updateUserToIndexedDB = (user: User) => {
  return new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open('fun_chat_user_db', 1);
      request.onerror = (event: any) => {
          reject(event.target.errorCode);
      };
      request.onsuccess = (event: any) => {
          const db = event.target.result;
          const transaction = db.transaction(['users'], 'readwrite');
          const objectStore = transaction.objectStore('users');
          const request = objectStore.get(user.id);
          request.onsuccess = (event: any) => {
            const data: User = event.target.result;
            data.assistant = user.assistant;
            const requestUpdate = objectStore.put(data);
            requestUpdate.onerror = (event: any) => {
              // Do something with the error
            };
            requestUpdate.onsuccess = (event: any) => {
              // Success - the data is updated!
            };
            transaction.oncomplete = () => {
              resolve();
            };
          };
      };
      request.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          const objectStore = db.createObjectStore('users', { keyPath: 'name' });
      };
  });
};

export const getUserFromIndexedDB = () => {
    return new Promise<User[]>((resolve, reject) => {
        const request = window.indexedDB.open('fun_chat_user_db', 1);
        request.onerror = (event: any) => {
            reject(event.target.errorCode);
        };
        request.onsuccess = (event: any) => {
            const db = event.target.result;
            const transaction = db.transaction(['users'], 'readonly');
            const objectStore = transaction.objectStore('users');
            const getRequest = objectStore.getAll();
            getRequest.onsuccess = () => {
                resolve(getRequest.result);
            };
            getRequest.onerror = (error: any) => {
                reject(error);
            };
        };
        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            db.createObjectStore('users', { keyPath: 'id' });
        };
    });
};
