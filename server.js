const net = require('net');
require('dotenv').config()
var cron = require('node-cron');
var SunCalc = require('suncalc3');
const port = 8080
const { default: fetch } = require('node-fetch');

const server = net.createServer(function(connection) { 
   console.log('client connected');
   
   connection.on('end', function() {
      console.log('client disconnected');
   });
   
   connection.pipe(connection);
});

const msg1 = {"content": `<@${process.env.userId}> The sun is about to cover your window ☀️😁`}
const msg2 = {"content": `<@${process.env.userId}> The sun is about to get past your window 🌄😁`}

const messageStore = new Map()

server.listen(port, function() { 
    console.log('server is listening on port: ' + port);
    cron.schedule('* * * * *', () => {
        const getCurrentSunPosition = SunCalc.getPosition(new Date(), process.env.latitude, process.env.longitude)
        // if the sun is covering the position
        if (getCurrentSunPosition.azimuthDegrees > 144 && getCurrentSunPosition.azimuthDegrees < 289) {
            if (messageStore.has(msg1)) {
                return;
            } else {
                fetch(process.env.url, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(msg1)
            })
                if (messageStore.has(msg2)) messageStore.delete(msg2)
                messageStore.set(msg1)
            }
        } else {
            if (messageStore.has(msg1)) {
                fetch(process.env.url, {
                    method: "post",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(msg2)
                })
                if (messageStore.has(msg1)) messageStore.delete(msg1)
                messageStore.set(msg2)
            } else {
                return;
            }
        }
      });
 });