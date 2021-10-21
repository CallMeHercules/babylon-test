var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var PF 		= require('pathfinding');

app.use(express.static(__dirname + '/public'));

http.listen(80, function() {
  console.log("Server is listening on port 80");
});
