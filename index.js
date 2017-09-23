const http = require('http')
const SerialPort = require('serialport')
const stringDecoder = require('string_decoder')
const port = 8000
const fs = require('fs')

const decoder = new stringDecoder.StringDecoder('utf8')

var sPort = new SerialPort('/dev/ttyUSB0', {
	baudRate: 57600
})

sPort.on('data', (data) => {
    var newData = data.toString('utf8')
    // var newData = decoder.write(data)
    console.log(newData)

    // console.log(data)
    // console.log(data.toString('utf8'))

    fs.writeFile('/tmp/test.txt', newData, (error) => {
        if (error) {
            console.log(error)
        }
    })
})

sPort.on('error', (error) => {
    console.log(error)
})

var sendData = () => {
    // Get data from serial port.
    // Send data.
}

const requestHandler = (request, response) => {
    switch (request.url) {
        case '/get-data':
            sendData();
            break;
    }
    // console.log(request.url)
    response.end()
}

const server = http.createServer(requestHandler)

server.listen(port, (error) => {
    if (error) {
        console.error(error)
    }
    console.log('Listening to localhost:8000')
})
