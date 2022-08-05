var express = require("express");
var cors = require("cors");
var morgan = require("morgan");
const app = express();
const tf = require('@tensorflow/tfjs');
const fs = require('fs/promises')
const PORT = 3000;
const axios = require('axios')
require('dotenv').config()
const token = process.env.TOKEN
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const {servers} = require("./edge-servers.json")
const { NetworkCount, callApi } = require('./util');

const currentModel = tf.sequential();

//require token
app.use("*",(req,res,next)=>{
    const prefix = "Bearer ";
    const auth = req.header("Authorization");
    if(!auth || auth.slice(prefix.length) != token){
        next({error:"unauthorized user", message: "no access"})
    }
    next()
})

/**
 * entrypoint for testing.  
 */
app.post('/recieve/start',async (req,res,next)=>{
    //do convex op
    //determine iterations
    
    const iterations = new NetworkCount()
    
    //get viable edge-servers and clients
    const viable = new NetworkCount(1)
    for(let i = 0; i < servers.length; i++){
        const ip = servers[i]
        try {
            const res = await callApi({
                url:`${ip}/send/viable`,
                token
            })
            const data = await res.json()
            
            viable.edge_server++
            viable.local += data.clients

        } catch (error) {
            console.error(error);
        }
    }


    //do convex optimization here
    iterations.global = 3
    iterations.edge_server = 6
    iterations.local = 5

    //iterate over each edge server asking it to run aggregation on viable clients
    const results = []
    for (let i = 0; i < iterations.global; i++) {
        try {
            const res = await callApi({
                url:`${ip}/receive/train-clients`,
                token,
                body:{
                    iterations
                }
            })
            //parse res into TF model

            results.push(res)
            //aggregate current model with new model

        } catch (error) {
            console.error(error);
        }
    }
    
    
})

app.put('/register/edge-server',async (req,res,next)=>{
    console.log(req.ip);
    console.log(servers);
    if(!servers.filter(ip=>req.ip == ip).length){
        servers.push(req.ip)
        await fs.writeFile("./edge-servers.json", JSON.stringify({servers}))
        res.send("ip added!")
    } else {
        res.send("no ip added")
    }
})

app.post('/send/training-data-mnist',(req,res,next)=>{
    //is this needed?
})

app.get('/',(req,res,next)=>{
    res.send("server do be running!")
})

app.use("*", (req, res, next) => {
    res.status(404);
    res.send({ error: "Request not found." });
    console.error("request not found");
});
  
app.use((error, req, res, next) => {
    res.status(500);
    res.send({ error });
    console.error(error);
});

app.listen(PORT,()=>{
    console.log("listening on port: ", PORT);
})