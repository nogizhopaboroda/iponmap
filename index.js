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
var MAP_AR = 162 / 36; // 4.5
var terminalAr = process.stdout.columns / process.stdout.rows;

var matrix = 
  terminalAr > MAP_AR
  ? /* log on left */
    /*   w      h     l      t */  
    [
      ["80%", "100%", 0    , 0    ],
      ["20%", "100%", "80%", 0    ]
    ]
  : /* log on bottom */
    [
      ["100%", "80%", 0    , 0    ],
      ["100%", "20%", 0    , "80%"]
    ]

var screen = blessed.screen({
  input: ttys.stdin, 
  output: process.stdout
});

var grid = new contrib.grid({rows: 2, cols: 2, screen: screen})

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
 return process.exit(0);
});

//var map = grid.set(0, 0, 2, 2, contrib.map, {label: 'Map'});
var map = contrib.map({
  label: 'Map',
  width:  matrix[0][0],
  height: matrix[0][1],
  left:   matrix[0][2],
  top:    matrix[0][3],
  xPadding: 0,
  border: {type: "line", fg: "cyan"}
});
screen.append(map);

//var log = grid.set(1, 0, 1, 2, contrib.log, { fg: "green" , selectedFg: "green" , label: 'Log'});
var log = contrib.log({ 
  fg: "green" , 
  selectedFg: "green" , 
  label: "Log",
  width:  matrix[1][0],
  height: matrix[1][1],
  left:   matrix[1][2],
  top:    matrix[1][3],
  xPadding: 0,
  border: {type: "line", fg: "cyan"}
});
log.log(process.stdout.columns + 'x' + process.stdout.rows);
//console.log(process.stdout.columns + 'x' + process.stdout.rows);
screen.append(log);
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


//  w        h   aspect ratio    matrix 
//150-170 / 36 ~ 4                1x4
//75-105 / 36  ~ 2                1x2
//
//
// matrix formula: 1 / (apect ratio)  if AR >= 2
