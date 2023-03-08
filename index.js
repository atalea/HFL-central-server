var express = require("express");
var cors = require("cors");
var morgan = require("morgan");
const app = express();
const tf = require('@tensorflow/tfjs');
const fs = require('fs/promises')
const PORT = 3001
//const axios = require('axios')
require("dotenv").config()
const token = process.env.TOKEN
app.use(cors())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const { NetworkCount, callApi } = require("./util");
const { readFileSync } = require("fs");
const { MnistData } = require("./data");

const mnist = new MnistData()
mnist.load()
const setup = async () => {
  const files = await fs.readdir(process.cwd())
  if(files.filter(f=>f===".edge-servers.json").length === 0) {
    fs.writeFile("./.edge-servers.json", JSON.stringify({ servers:[] }))
  }
  if(files.filter(f=>f===".env").length === 0) {
    fs.writeFile("./.env", "TOKEN=token")
  }
}

setup()
//model to train
const currentModel = tf.sequential();

//require token
app.use("*", (req, res, next) => {
  const prefix = "Bearer "
  const auth = req.header("Authorization")
  if (!auth || auth.slice(prefix.length) != token) {
    next({ error: "unauthorized user", message: "no access" })
  }
  next()
})

/**
 * entrypoint for testing.
 */
app.get("/receive/start", async (req, res, next) => {
  const jsonData = await fs.readFile('./.edge-servers.json')
  const {servers} = JSON.parse(jsonData)
  //do convex op
  //determine iterations
  
    const iterations = new NetworkCount()

    //get viable edge-servers and clients
    const viable = new NetworkCount(1)
    for (let i = 0; i < servers.length; i++) {
      const ip = servers[i]
      try {
        const res = await callApi({
          url: `${ip}:3000/send/viable`,
          token,
        })

        viable.edge_server++
        viable.local += res.clients
      } catch (error) {
        console.error(error)
      }
    }
    //do convex optimization here
    iterations.global = 3
    iterations.edge_server = 6
    iterations.local = 5

    //iterate over each edge server asking it to run aggregation on viable clients
    const results = []
    for (let g = 0; g < iterations.global; g++) {
      for (let i = 0; i < servers.length; i++) {
        const ip = servers[i]
        try {
          const res = await callApi({
            url: `${ip}:3000/receive/train-clients`,
            method: "POST",
            token,
            body: {
              iterations,
            },
          })
          //parse res into TF model

          results.push(res)
          //https://js.tensorflow.org/api/3.18.0/#io.http
          //aggregate current model with new model
        } catch (error) {
          console.error(error)
        }
    }
  }
})

app.put("/register/edge-server", async (req, res, next) => {
  const jsonData = await fs.readFile('./.edge-servers.json')
  const {servers} = JSON.parse(jsonData)
  const new_ip = req.ip.startsWith('::ffff:') ? req.ip.slice(7) : req.ip
  if (!servers.filter((ip) => new_ip == ip).length) {
    
    servers.push(new_ip)
    await fs.writeFile("./.edge-servers.json", JSON.stringify({ servers }))
    res.send("ip added!")
  } else {
    res.send("no ip added")
  }
})
//send data & model to edge-servers
app.post("/send/training-data-mnist", (req, res, next) => {
  res.send({
    headers:{auth:'Bearer ' + process.env.TOKEN},
    model:currentModel,
    trainingData:mnist.nextTestBatch()
    })
})

app.get("/", (req, res, next) => {
  res.send("server is running!")
})

app.use("*", (req, res, next) => {
  res.status(404)
  res.send({ error: "Request not found." })
  console.error("request not found")
})

app.use((error, req, res, next) => {
  res.status(500)
  res.send({ error })
  console.error(error)
})
0
app.listen(PORT,()=>{
    console.log("listening on port: ", PORT);
})