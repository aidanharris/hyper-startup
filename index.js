'use strict';

// let fs = require('fs');
let commands = [];
const exec = process.argv.indexOf('-e');

// debugging purposes
// function log(str) {
// 	fs.appendFile(`${__dirname}/log.txt`, str + '\n');
// }

function waitFor(object, key, fn) {
	if (key in object) {
		fn(object[key]);
	} else {
		setTimeout(() => waitFor(object, key, fn), 10);
	}
}

exports.onApp = function (obj) {
	const config = obj.config.getConfig();
	if (config.commands) {
		commands = config.commands;
	}
	if (exec !== -1 && process.argv[exec+1]) {
		commands = [process.argv[exec+1]];
		if (process.argv.indexOf('--hold') === -1 && process.argv.indexOf('--noclose') === -1) {
			commands[0]+=';exit $?';
		}
	}
};

exports.onWindow = win => {
	win.rpc.on('execute commands', uid => {
		commands.forEach(cmd => {
			win.sessions.get(uid).write(cmd + '\r');
		});
	});
};

exports.onRendererWindow = win => {
	waitFor(win, 'rpc', rpc => {
		rpc.on('session add', details => {
			const { uid } = details;
			rpc.emit('execute commands', uid);
		});
	});
};
