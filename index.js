const http = require('http')
const SerialPort = require('serialport')
const stringDecoder = require('string_decoder')
const sqlite = require('sqlite3')
const fs = require('fs')
const port = 8000

const decoder = new stringDecoder.StringDecoder('utf8')

var db = new sqlite.Database('./data.db')
db.run('CREATE TABLE IF NOT EXISTS temperatures (date DATETIME, t1 INT, t2 INT, t3 INT, t4 INT, t5 INT, t6 INT)')
db.on('error', (error) => {
    console.log(error)
})

var sPort = new SerialPort('/dev/ttyUSB0', {baudRate: 9600})

var theData

var rnd = () => {
    return Math.floor(Math.random() * (100 - 50) + 50)
}

sPort.on('data', (data) => {
    var newData = decoder.write(data)

    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth()
    var day = date.getDate()
    var hours = date.getHours()
    var minutes = date.getMinutes()
    var seconds = date.getSeconds()
    var formatedDate = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds

    // theData = formatedDate + ' ' + newData.replace(/(\r\n|\n|\r)/gm,'') + "128\n"
    // theData = hours + ':' + minutes + ':' + seconds + ' ' + '13 10 23 54 45 128\n'
    theData = `${hours}:${minutes}:${seconds} ${rnd()} ${rnd()} ${rnd()} ${rnd()} ${rnd()} ${rnd()}\n`
    console.log(theData)

    db.exec(`INSERT INTO temperatures (date, t1, t2, t3, t4, t5, t6) VALUES("${formatedDate}", 13, 10, 23, 54, 45, 128)`)

    // fs.appendFile('/tmp/test', theData, (error) => {
    //     if (error) {
    //         console.log(error)
    //     }
    // })
})

sPort.on('error', (error) => {
    console.log(error)
})

var sendData = (response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.write(theData)
}

const requestHandler = (request, response) => {
    switch (request.url) {
        case '/get-data':
            sendData(response);
            break;
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
