const http = require('http')
const SerialPort = require('serialport')
const stringDecoder = require('string_decoder')
const si = require('systeminformation')
const sqlite = require('sqlite3')
const Promise = require('promise')
const fs = require('fs')
const port = 8000

const decoder = new stringDecoder.StringDecoder('utf8')

var db = new sqlite.Database('./data.db')
db.run('CREATE TABLE IF NOT EXISTS temperatures (date DATETIME, t1 INT, t2 INT, t3 INT, t4 INT, t5 INT, t6 INT)')
db.on('error', (error) => {
    console.log(error)
})

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

        db.exec(`INSERT INTO temperatures (date, t1, t2, t3, t4, t5, t6) VALUES("${shortDate}", "${splitData[0]}", "${splitData[1]}", "${splitData[2]}", "${splitData[3]}", "${splitData[4]}", "${temperature}")`)
    }) 
})

sPort.on('error', (error) => {
    console.log(error)
})

var sendDataNow = (response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.write(dataNow)
}

var sendDataAll = (response) => {
    var newData
    db.each(`SELECT * FROM temperatures`, (error, row) => {
        var date = data.date
        var t1 = data.t1
        var t2 = data.t2
        var t3 = data.t3
        var t4 = data.t4
        var t5 = data.t5
        var t6 = data.t6
        newData += `${date} ${t1} ${t2} ${t3} ${t4} ${t5} ${t6}`
    })
    response.write(newData)
}

const requestHandler = (request, response) => {
    switch (request.url) {
        case '/get-data-now':
            sendDataNow(response)
            break
        case '/get-data-all':
            sendDataAll(response)
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
