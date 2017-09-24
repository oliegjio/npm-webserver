const http = require('http')
const SerialPort = require('serialport')
const stringDecoder = require('string_decoder')
const si = require('systeminformation')
const fs = require('fs')
const port = 8000

const decoder = new stringDecoder.StringDecoder('utf8')

var sPort = new SerialPort('/dev/ttyUSB0', {baudRate: 9600})

var dataNow

var rnd = () => {
    return Math.floor(Math.random() * (100 - 50) + 50)
}

sPort.on('data', (data) => {
    var newData = decoder.write(data).replace(/(\r\n|\n|\r)/gm,'')
    var splitData = newData.split(' ')

    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth()
    var day = date.getDate()
    var hours = date.getHours()
    var minutes = date.getMinutes()
    var seconds = date.getSeconds()
    var shortDate = hours + ':' + minutes + ':' + seconds 
    var longDate = year + '-' + month + '-' + day + ' ' + shortDate

    si.cpuTemperature((data) => {
        temperature = data.max

        dataNow = `${shortDate} ${newData}${temperature}\n`
        console.log(dataNow)

        var fs = require('fs');
        fs.appendFile("/tmp/temperature-logs.txt", dataNow, function(error) {
            if(error) {
                return console.log(error);
            }
        }); 

    }) 
})

sPort.on('error', (error) => {
    console.log(error)
})

var sendDataNow = (response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.write(dataNow)
}

const requestHandler = (request, response) => {
    switch (request.url) {
        case '/get-data-now':
            sendDataNow(response)
            break
        default:
            response.write('Wrong Request!')
    }
    response.end()
}

const server = http.createServer(requestHandler)

server.listen(port, (error) => {
    if (error) {
        console.error(error)
    }
    console.log('Listening to localhost:8000')
})
