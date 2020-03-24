var os = require('os');
var cluster = require('cluster');
const logger = require('./utils/winstonLogger');

if (cluster.isMaster) {
    const cpuCount = os.cpus().length;
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork()
    }

    cluster.on( 'online', function( worker ) {
        console.log( 'Worker ' + worker.process.pid + ' is online.' );
    });
    cluster.on( 'exit', function( worker, code, signal ) {
        console.log( 'worker ' + worker.process.pid + ' died.' );
        cluster.fork()
    });

}
else {
    if(process.env.NODE_APP_INSTANCE === '0')
    require('./app')
}
