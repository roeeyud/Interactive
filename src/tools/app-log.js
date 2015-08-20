var bunyan = require('bunyan'),
    streams= [
        {stream: process.stdout, level: 'debug'}
    ],
    log = bunyan.createLogger({
        name: 'game-receiver',
        streams: streams
    });

module.exports =  log;