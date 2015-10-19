# iponmap

IpOnMap is a CLI application that visualises geoip data on the world map using awesome nodejs dashboard library [blessed-contrib](https://github.com/yaronn/blessed-contrib). 

Try it, feel yourself a real hacker.

**Demo:**

<img src="screenshot.png" alt="term" width="800">

[screencast demo](https://youtu.be/38YvtaQ3gRs)

## Installation
```shell
npm install -g iponmap
```

## Usage
pass ips as a parameters
```shell
iponmap ip1 ip2 ip3
```
or through stdin (one ip per line)
```shell
cat iplist.txt | iponmap
```
or
```shell
iponmap < iplist.txt
```
or even
```shell
tail -f iplist.log.txt | iponmap  #draws new point on new line
```

#### Exit from application
**escape**, **q** , **Ctrl-c**

## Bugs/Issues/Feature requests
Create new issue [here](https://github.com/nogizhopaboroda/iponmap/issues)
