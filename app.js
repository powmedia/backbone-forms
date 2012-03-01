
/**
 * Module dependencies.
 */

var express = require('express')
var app = module.exports = express.createServer();
// Configuration

app.configure(function(){
  app.use(express.static(__dirname));
});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
