const registerChat = ({ io, socket, db, openai }) => {
  return async (user, callback) => {
    try {
      if (await db.userNameAlreadyExists(user)) {
        callback({
          status: 3,
          message: "User name already registered!",
          socketId: socket.id,
        });
      } else {
        db.writeUserData({
          ...user,
          socketId: socket.id,
        }).then(
          (res) => {
            callback({
              status: 0,
              message: "User successfully registered!",
              socketId: socket.id,
            });
          },
          (err) => {
            callback({
              status: 1,
              message: err,
              socketId: socket.id,
            });
          }
        );
      }
    } catch (e) {
      callback({
        status: 1,
        message: "Error while registering user - " + e,
        socketId: socket.id,
      });
    }
  };
};

module.exports = { registerChat };
