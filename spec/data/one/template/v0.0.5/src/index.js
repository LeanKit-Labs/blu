process.title = '${projectName}';
var autohost = require( 'autohost' );
var hyped = require( 'hyped' );
var host = hyped.createHost( autohost, {} );
host.start();
