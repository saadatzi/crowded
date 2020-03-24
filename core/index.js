cluster = require('cluster');
const os = require('os');
let ran = false;

const createWorker = type => {
	const new_worker_env = {
		WORKER_TYPE: type
	};

	let worker = cluster.fork(new_worker_env);
	worker.type = type;

	return worker;
}

if (cluster.isMaster) {
	// Count the machine's CPUs
	const cpuCount = Math.min(os.cpus().length, 4);

	// Create a worker for each CPU

	let onetimeWorker = createWorker('onetime', 0);

	for (let i = 0; i < cpuCount; i += 1) {
		let worker = createWorker('normal');
	}

	const gulp = require('./templates/default/gulpfile.js');
	console.log('Starting gulp!');
	gulp.task('pach')(function() {
		console.log('[GULP DONE]');

		if (!ran) {
			ran = true;
		}
	});

	// Listen for dying workers
	cluster.on('exit', function(worker) {
		console.log('Worker %d died :(', worker.id, worker.type);
		if (worker.type) {
			createWorker(worker.type);
		}
	});
} else {
	_runNode(process.env['WORKER_TYPE']);
}

function _runNode(type) {
	const db = require('./utils/database');
	db.query('SELECT 1+1', function(err, rows, fields) {
		if (err) throw err;
		console.log(cluster.worker.id, 'MysqlClient connected.', process.env['WORKER_TYPE']);
		
		switch(type){
			case 'normal':
				_start();
				break;
			case 'onetime':
				require('./singleRun');
				break;
		}
	});
}

function _start() {
	const app = require('./app');
	const http = require('http');

	const port = normalizePort(process.env.PORT || '7000');
	app.set('port', port);

	const server = http.createServer(app);

	server.setTimeout(10 * 60 * 1000);
	server.on('error', onError);
	// server.on('listening', onListening);
	server.listen(port, 'localhost');
	console.log('******** kidsNode start server in port: ' + port);
	function onListening() {
		const addr = server.address();
		const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
		console.log('Listening on ' + bind);
	}

	function normalizePort(val) {
		const port = parseInt(val, 10);

		if (isNaN(port)) {
			// named pipe
			return val;
		}

		if (port >= 0) {
			// port number
			return port;
		}

		return false;
	}

	function onError(error) {
		if (error.syscall !== 'listen') {
			throw error;
		}

		const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

		// handle specific listen errors with friendly messages
		switch (error.code) {
			case 'EACCES':
				console.error(bind + ' requires elevated privileges');
				process.exit(1);
				break;
			case 'EADDRINUSE':
				console.error(bind + ' is already in use');
				process.exit(1);
				break;
			default:
				throw error;
		}
	}
}
