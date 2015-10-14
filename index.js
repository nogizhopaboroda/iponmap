/*
¹
²
³
×
°
·
*/


var blessed = require('blessed');
var contrib = require('blessed-contrib');
var ttys     = require('ttys');
var geoip = require('geoip-lite');


/**/
var screen = blessed.screen({
  input: ttys.stdin, 
  output: process.stdout
});

var grid = new contrib.grid({rows: 2, cols: 2, screen: screen})

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
 return process.exit(0);
});

var map = grid.set(0, 0, 1, 2, contrib.map, {label: 'Map'});
//screen.append(map);

var log = grid.set(1, 0, 1, 2, contrib.log, { fg: "green" , selectedFg: "green" , label: 'Log'});
//screen.append(log);
/**/


var data = process.argv.slice(2);
if(data.length){
  drawMarkers(data);
} else {
  var input_data = [];
  var stream = process.stdin;
  stream.on('data', function(data) {
    input_data = [].concat(data.toString().split("\n").slice(0, -1)); 
    drawMarkers(input_data);
  });
  stream.on('end', function() { 
  });
  stream.on('error', function(){});
}



function drawMarkers(ipList){

  ipList.forEach(function(ip){
    var geo = geoip.lookup(ip);
    map.addMarker({"lon" : "" + geo.ll[1], "lat" : "" + geo.ll[0], color: "red", char: "·" })
    log.log(ip + " (" + (geo.city || "<unknown city>") + ", " + geo.country + ")");
  });

  screen.render();

}

