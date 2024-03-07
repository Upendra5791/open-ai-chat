const searchUser = ({ io, socket, db, openai }) => {
  return (data, callback) => {
    const filteredList = Object.keys(db.getUserMap())
      .map((key) => {
        return db.getUserMap()[key];
      })
      .filter((f) => f.name.toLowerCase().includes(data.toLowerCase()));
    callback({
      results: filteredList,
    });
  };
};

module.exports = { searchUser };
