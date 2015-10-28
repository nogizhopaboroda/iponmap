#!/usr/bin/env node

var blessed     = require('blessed');
var contrib     = require('blessed-contrib');
var ttys        = require('ttys');
var geoip       = require('geoip-lite');
var packageInfo = require("./package.json");

hasArgs(['--help', '-h']) && drawHelp();
hasArgs(['--version', '-v']) && (console.log(packageInfo.version) || process.exit(0));

var TRACER  = hasArgs(['--trace', '-t']) ? 1    : 0;
var COUNTER = hasArgs(['--count', '-c']) ? true : false;

var map, log, screen;

var data = cleanArgs();

drawApp();

if(data.length){
  drawMarkers(data);
} else {
  var input_data = [];
  var stream = process.stdin;
  stream.on('data', function(data) {
    input_data = [].concat(data.toString().split("\n").slice(0, -1)); 
    drawMarkers(input_data);
  });
}

function drawHelp(){
  console.log(
    (function(){/*
        Usage: iponmap [options] [ip...]

        Options:

          -h, --help            output usage information
          -v, --version         output the version number
          -t, --trace           trace points
          -c, --count           count uniq points
    */})
    .toString()
    .replace(/function.*\{\/\*([\s\S]+)\*\/\}$/ig, "$1")
  );

  process.exit(0);
}

function drawApp(){
  var MAP_AR = 162 / 36; // map aspect ratio, 4.5
  var terminalAr = process.stdout.columns / process.stdout.rows; // terminal aspect ratio

  var matrix = 
    terminalAr > MAP_AR
      ? /* log on left */
      /*   w      h     l      t */  
      [
        ["80%", "100%", 0    , 0    ], /* map */
        ["20%", "100%", "80%", 0    ]  /* log */
      ]
      : /* log on bottom */
      [
        ["100%", "80%", 0    , 0    ],
        ["100%", "20%", 0    , "80%"]
      ]

  screen = blessed.screen({
    input: ttys.stdin, 
    output: process.stdout
  });

  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });

  map = contrib.map({
    label: 'Map',
    width:  matrix[0][0],
    height: matrix[0][1],
    left:   matrix[0][2],
    top:    matrix[0][3],
    xPadding: 0,
    border: {type: "line", fg: "cyan"}
  });
  screen.append(map);

  log = contrib.log({ 
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
  screen.append(log);
}

var counterMap = {};
function drawMarkers(ipList){
  ipList.forEach(function(ip){
    var match = ip.match(/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/);
    if(!match) { return; }
    ip = match[0];
    var geo = geoip.lookup(ip);
    if(!geo) { return; }
    var markerChar = "°";
    if(TRACER){
      markerChar = "" + TRACER;
      TRACER++;
    }
    if(COUNTER){
      var key = geo.ll[0] + "|" + geo.ll[1];
      counterMap[key] = (counterMap[key] || 0) + 1;
      markerChar += "(" + counterMap[key] + ")";
    }
    map.addMarker({"lon" : "" + geo.ll[1], "lat" : "" + geo.ll[0], color: "red", char: markerChar });
    log.log((TRACER ? "" + markerChar + ") " : "") + ip + " (" + (geo.city || "<unknown city>") + ", " + geo.country + ")");
  });
  screen.render();
}

function hasArgs(argsList){
  var argsList = [].concat(argsList);
  for(var arg in argsList){
    if(~process.argv.indexOf(argsList[arg])){
      return true;
    }
  }
  return false;
}

function cleanArgs(){
  var args = [];
  process.argv.slice(2).forEach(function(arg){
    !/^[-]{1,2}/.test(arg) && args.push(arg);
  });
  return args;
}
