const { NetworkCount, callApi } = require("./util");
const token = process.env.TOKEN;

callApi({
    url: `127.0.0.1:3001/receive/start`,
    token: 'token',
  });
console.log(process.env.TOKEN);