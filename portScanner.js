const net = require('net');
const commonPorts = require('./ports.json');
const readline = require('readline');
const ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const rl = new readline.createInterface({ input: process.stdin, output: process.stdout });
/*
TODO:try this later 
function getArgs () {
    const args = {};
    process.argv
        .slice(2, process.argv.length)
        .forEach( arg => {
        // long arg
        if (arg.slice(0,2) === '--') {
            const longArg = arg.split('=');
            const longArgFlag = longArg[0].slice(2,longArg[0].length);
            const longArgValue = longArg.length > 1 ? longArg[1] : true;
            args[longArgFlag] = longArgValue;
        }
        // flags
        else if (arg[0] === '-') {
            const flags = arg.slice(1,arg.length).split('');
            flags.forEach(flag => {
            args[flag] = true;
            });
        }
    });
    return args;
}
const args = getArgs();
console.log(args);
*/
function StartScan(resolve, rej) {
	let COUNTER = 0;
	function AskForHost() {
		rl.question('what ip to scan?\n\n', (host) => {
			if (host.match(ipformat)) {
				ScanHost(host);
			} else {
				console.log('not a valid ip m8');
				AskForHost();
			}
		});
	}
	function FinilizeConnection(client) {
		COUNTER++;
		client.end();
		client.destroy();
		console.log(COUNTER);

		if (COUNTER == commonPorts.length - 1) {
			resolve(commonPorts);
		}
	}
	function ScanHost(host) {
		for (let idx = 0; commonPorts.length > idx; idx++) {
			let client = new net.Socket();
			client.setEncoding('utf8');
			try {
				client.connect(
					{
						port: commonPorts[idx].Port,
						host
					},
					() => {
						commonPorts[idx].status = 'V';
						console.log(`***${commonPorts[idx].Name}-${commonPorts[idx].Port} is open!***`);
						client.on('data', (data) => {
							console.log(`port ${commonPorts[idx].Port} says ${data}`);
							if (data.toLowerCase().indexOf('error') != -1) {
								commonPorts[idx].status = 'XV';
							}
							FinilizeConnection(client);
						});
					}
				);
			} catch (ex) {
				console.error(ex);
				commonPorts[idx].status = 'x';
				FinilizeConnection(client);
			}
			setTimeout(() => {
				FinilizeConnection(client);

				if (!commonPorts[idx].status) {
					commonPorts[idx].status = 'x';
				}
			}, 500);

			client.on('error', function(err) {
				console.error(err);
				commonPorts[idx].status = 'x';
				FinilizeConnection(client);
			});
		}
	}

	AskForHost();
}
let p = new Promise(StartScan);
exports.default = p;
