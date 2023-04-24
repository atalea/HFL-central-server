const express = require('express');
const multer  = require('multer');
const path = require('path');
const { errorMiddleware, authMiddleware, sendDownstream, aggregate, generateTrainPartitions, convertTypedArray } = require('./util.js');
const { model } = require('./model.js');
const config = require('./config.js');
const app = express();
app.use(express.json());
app.use("/model", authMiddleware, express.static(path.join(__dirname, "model")));
app.use(errorMiddleware);
const upload = multer();

const edge_servers = {};
let training_in_progress = false;
let central_iterations = config.centralIterations;

app.get('/', async (req, res) => {
    //Replace with control panel or information...
    res.json({message: 'Hello World!'});
});

//Begin the training proccess
//Called by launching start_sim or connecting with /start
app.get('/start', async (req, res) => {
    training_in_progress = true;
    res.json({message: 'Starting!'});
    const curModel = {};
    //generate the indexes of which data will be sent to each client
    curModel.data = generateTrainPartitions(edge_servers, config.dataSize);
    console.log(`Prepped data for ${curModel.data.length} edge servers. There are ${curModel.data.reduce((a, b) => a + b.length, 0)} total clients.`);
    //save new data information on model and load model parameterss
    await model.save("file://" + path.join(__dirname, "model")); 
    curModel.model = `http://${config.host}:${config.port}/model/model.json`;
    curModel.iterations = config.iterations;
    let i = 0;
    //send initial model to all edge servers
    for (let e in edge_servers){
        const emodel = Object.assign({}, curModel);
        emodel.data = emodel.data[i];
        edge_servers[e].data = emodel;
        i+=1;
    }
    await sendDownstream(edge_servers);
    console.log("Sending model to edge servers!");
});

app.use(authMiddleware);

//Handles edge server registration puts each into an array indexed by url
app.post('/register', async (req, res) => {
    if (training_in_progress) {
        res.json({message: 'failed to register - training in progress!'});
        return false;
    }
    res.json({message: 'successfully registered!'});
    edge_servers[req.body.url] = {url: req.body.url};
    console.log(`Edge server connected from ${req.body.url}!`);
});

//Recieves each edges trained model
app.post('/upload', upload.fields([{ name: 'weights', maxCount: 1 }, { name: 'shape', maxCount: 1 }]), async (req, res) => {
    const eurl = req.body.url;
    res.json({message: 'received model!'});
    console.log("Received model from edge server!");
    console.log(`Training Time for Edge:\n\t${JSON.parse(req.body.metric)}`);
    let decoded = [];
    let ind = 0;
    //proccess recieved weights and shape
    let wBuff = convertTypedArray(req.files['weights'][0].buffer, Float32Array);
    let shape = convertTypedArray(req.files['shape'][0].buffer, Uint32Array);
    for (let i = 0; i < shape.length; i += 1){
        decoded.push(wBuff.slice(ind, ind+shape[i]));
        ind += shape[i];
    }
    edge_servers[eurl].model = decoded;
    const agg = await aggregate(edge_servers);
    if (agg){
        let threshold = false;
        console.log("Central Server iteration complete!");
        console.info(`Model accuracy: ${agg*100}%! (Target: ${config.centralAccuracy*100}%)`);
        if (config.centralUseIterations){
            curIterations -= 1;
            threshold = curIterations <= 0;
        } else{
            threshold = curAccuracy >= config.centralAccuracy;
        }
        if (threshold){
            curIterations = config.centralIterations;
            await sendDownstream(edge_servers);
        } else{
            console.log("ALL DONE!!!");
            training_in_progress = false;
        }
    }
});

app.post('/status', async (req, res) => {
    res.json({message: 'acknowledged!'});
    edge_servers[req.body.url].numClients = req.body.numClients;
    console.log(`Edge ${req.body.url} has ${req.body.numClients} client(s)!`)
});

app.get('*', async (req, res) => {
    res.send("Page Not Found!");
});

app.listen(config.port, config.host, async () => {
    console.log(`Central Server running on port ${config.host}:${config.port}!`);
});