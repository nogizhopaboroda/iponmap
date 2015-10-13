var blessed = require('blessed');
var contrib = require('blessed-contrib');
var ttys     = require('ttys');
var geoip = require('geoip-lite');


var input_data = '';
var stream = process.stdin;
stream.on('data', function(data) { input_data += data.toString(); });
stream.on('end', function() { 
  app(input_data.replace("\n", ""), ttys.stdin, process.stdout);
});
stream.on('error', function(){});


function app(ip, input, output){

  var geo = geoip.lookup(ip);

  var screen = blessed.screen({
    input: input, 
    output: output
  });

  var map = contrib.map({label: 'WhereIsIt'});

  screen.append(map);

  map.addMarker({"lon" : "" + geo.ll[1], "lat" : "" + geo.ll[0], color: "red", char: "*" })

  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
   return process.exit(0);
  });

  screen.render()

}

