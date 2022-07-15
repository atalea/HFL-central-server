var express = require("express");
var cors = require("cors");
var morgan = require("morgan");
const app = express();
const tf = require('@tensorflow/tfjs');
const fs = require('fs/promises')
const PORT = 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const {servers} = require("./edge-servers.json")
const { Iterations } = require('./util');

/**
 * entrypoint for testing.  
 */
app.post('/recieve/start',async (req,res,next)=>{
    //do convex op
    //determine iterations
    const iterations = new Iterations()
    // console.log(servers);
    
    
})

app.put('register/edge-server',async (req,res,next)=>{
    console.log(req.ip);
    if(!servers.filter(ip=>req.ip == ip).length){
        servers.push(req.ip)
        await fs.writeFile("./edge-servers.json", JSON.stringify({servers}))
        res.send("ip added!")
    } else {
        res.send("no ip added")
    }
})

app.post('/send/training-data-mnist',(req,res,next)=>{

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