const socketCheck = ({ io, socket, db, openai }) => {
  return async (user, callback) => {
    try {
      db.writeUserData({
        ...user,
        socketId: socket.id,
      }).then((res) => {
        console.log(
          "User " + user.id + " registered with socket ID " + socket.id
        );
        callback({
          status: 0,
          message: "User successfully registered!",
          socketId: socket.id,
        });
      });
    } catch (e) {
      callback({
        status: 1,
        message: "Error while registering user - " + e,
        socketId: socket.id,
      });
    }
  };
};

module.exports = { socketCheck };
