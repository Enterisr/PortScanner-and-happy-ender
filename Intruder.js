const PortScanner = require('./portScanner').default;
PortScanner.then((commonPorts) => {
	console.table(commonPorts, [ 'Port', 'Name', 'status' ]);
});
