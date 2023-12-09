const express = require("express");
const bodyParser = require("body-parser");
const executeScriptV1 = require("./executeScriptV1");
const cors = require("cors");
const path = require('path')

const Redis = require("ioredis");

const app = express();
const port = 3002;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.static(path.join(__dirname, '../build')));

app.get("/helloWorld", (req, res) => {
  res.send("Hello World!!!");
});

app.post("/executeScriptV1", async (req, res) => {
  const script = req.body;
  const redisCluster = new Redis.Cluster(script.redisClusterNodes);
  const args = script.args;
  // const redisCluster = null;
  delete script.redisClusterNodes;
  delete script.args;
  await executeScriptV1.execute(script, redisCluster, args);
  redisCluster.quit();
  res.json(script);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
