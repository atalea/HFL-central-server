const axios = require('axios');
const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const zlib = require('zlib');
const util = require('util');
const fs = require('fs').promises;
const math = require('mathjs');

const token = 'token';
var testLbl, testImg;

const testDataRead = async (filename, size) => {
    const fbuf = await fs.readFile(filename);
    const gunzip = util.promisify(zlib.gunzip);
    const buf = await gunzip(fbuf);
    const ubuf = new Uint8Array(buf);
    const arr = new Float32Array(ubuf.buffer);
    return tf.tensor2d(arr, [arr.length / size, size])
}

const validateModel = async (model) => {
    if (!testLbl || !testImg){
        testLbl = await testDataRead("./central/model/lblval.bin", 10);
        testImg = await testDataRead("./central/model/imgval.bin", 784);
    }
    await model.compile({
        optimizer: "adam",
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
    });
    const eval = await model.evaluate(testImg, testLbl);
    const acc = await eval[1].array();
    return acc;
}

const sendDownstream = async (servers) => {
    for(let s in servers) {
        const server = servers[s];
        const opt = {
            url: `${server.url}/download`,
            method: "POST",
            data: server.data,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        const response = await axios(opt).catch((err) => {
            delete servers[s];
        });
    }
}

//sum all edge server weights
const aggregate = async (edge_servers) => {
    let totalDataSize = 0;
    for (let e in edge_servers) {
        if (!edge_servers[e].model) return false; //return if not all edge data is present
        totalDataSize += edge_servers[e].data.data[0].size;
    }
    //do learning
    ekeys = Object.keys(edge_servers);
    aggregatedModel = edge_servers[ekeys[0]].model;
    for (let e = 1; e < ekeys.length; e+=1){
        const emodel = edge_servers[ekeys[e]].model;
        for (let i = 0; i < emodel.length; i+=1){
            for (let j = 0; j < emodel[i].length; j+=1){
                if (e == 1) aggregatedModel[i][j] = emodel[i][j]*edge_servers[ekeys[e]].data.data[0].size/totalDataSize;
                else{
                    aggregatedModel[i][j] += emodel[i][j]*edge_servers[ekeys[e]].data.data[0].size/totalDataSize;
                }
            }
        }
    }
    const amodel = await tf.loadLayersModel("file://" + path.join(__dirname, "model","model.json"));
    const layers = amodel.layers;
    for (let i = 0; i < layers.length; i+=1) {
        layers[i].setWeights([tf.tensor(aggregatedModel[i*2], layers[i].kernel.shape), tf.tensor(aggregatedModel[i*2+1], layers[i].bias.shape)]);
    }
    await amodel.save("file://" + path.join(__dirname, "model"));
    return await validateModel(amodel);
}

/**
 * 
 * @param {*} edge_servers array of edge server data
 * @param {*} modelSize total size of dataset
 * @returns array of start index and size of each partitioon for each client
 */
const generateTrainPartitions = (edge_servers, modelSize) => {
    let numClient = 0;
    for (let ed in edge_servers) numClient += edge_servers[ed].numClients;
    let out = [];
    let ind = 0;
    for (let ed in edge_servers) {
        const edge = edge_servers[ed];
        let temp = []
        for (let i = 0; i < edge.numClients; i++) {
            //poisson distribution: multiplied by dataset size over number of clients and ~max result of poisson function
            let lambda = 5
            let x = math.floor(math.random()*9) +1;
            let dataSize = math.floor(modelSize/(.2*numClient)*math.pow(math.e,-lambda)*math.pow(lambda,x)/math.factorial(x));
            console.log(dataSize);
            temp.push({
                start: ind,
                size: dataSize
            });
            ind += dataSize;
        }
        out.push(temp);
    }
    return out;
}

const errorMiddleware = (err, req, res, next) => {
    if (err.status) res.status(err.status);
    else res.status(500);
    res.json({message: "Something Failed!"});
}
  
const authMiddleware = (req, res, next) => {
    const auth = req.header("Authorization");
    if (auth != `Bearer ${token}`) {
        res.status(403).send("Authentication Failed");
    }
    else next();
}

const convertTypedArray = (src, type) => {
    const buffer = new ArrayBuffer(src.byteLength);
    src.constructor.from(buffer).set(src);
    return new type(buffer);
}

module.exports = { errorMiddleware, authMiddleware, sendDownstream, aggregate, generateTrainPartitions, convertTypedArray };