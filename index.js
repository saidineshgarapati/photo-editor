const express = require("express");
const bodyparser = require("body-parser");
const mysql = require("mysql");

const app = express();

app.use(express.static("public"));

const connection = mysql.createConnection({
  host: "localhost",
  user: "saidinesh",
  password: "saidinesh"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected");
});

// app.get("/api/saved", function(req, res) {
//   connection.query("SELECT * FROM saved", function(error, results, fields) {
//     if (error) throw error;
//     data = results;
//   });
//   res.send(data);
// });

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("listening to 3000...."));
