var express = require('express'),
  server = express();



server.configure(function(){
  server.use(function(req, res, next){
    console.log('%s %s', req.method, req.url);
    next();
  });

  server.use(express.static(__dirname + '/public'));
});

server.listen(3141);