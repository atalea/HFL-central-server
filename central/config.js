require('dotenv').config();

const clientIterations = 3,
      edgeIterations = 3,
      centralIterations = 3;

const config = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "127.0.0.1",
    dataSize: 60000, //size of training data in total - can use less for quicker learning 
    iterations: [edgeIterations, clientIterations],
    centralIterations: centralIterations,
    centralAccuracy: 0.90,
    centralUseIterations: true // Uses accuracy metric if false
}

module.exports = config;