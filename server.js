var PORT_NUMBER = process.env.PORT || 3000;

var async = require('async');
var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
//var https = require('https');

var app = express();



//app.use(express.static("./public")); // sets standard files things. i.e /public/imgs will be /imgs; also enables public viewing of files in this folder
app.set('view engine', 'html'); 
app.set('port', PORT_NUMBER); 
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.listen(process.env.PORT || 3000);

app.get('/', function(request, response) {
  response.render('index.html');
});

app.get('/quiz', function(request, response) {
  var json = fs.readFileSync("data/quiz.json", "utf-8");
  response.send(json);
});

app.post('/quiz', function(request, response) {
  var newJson = JSON.stringify(request.body, null, 4);
  console.log(newJson);
  fs.writeFile('/data/js/quiz.json', newJson, function (err) {
  if (err) throw err;
  console.log('Save');
  });
  response.send(newJson);
});


