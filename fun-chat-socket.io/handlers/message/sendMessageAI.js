const sendMessageAI = ({ io, socket, db, openai }) => {
  return (data, callback) => {
    const { message, language } = data;
    console.log(message.text);
    openai
      .translateMessage({
        message,
        language,
      })
      .then(
        (res) => {
          callback(res);
        },
        (err) => {
          console.log(err);
        }
      );
  };
};

module.exports = { sendMessageAI };
