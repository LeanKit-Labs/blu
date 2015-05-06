var inquirer = require( 'inquirer' );
var when = require( 'when' );

module.exports = function( prompts, onAnswer ) {
	return when.promise( function( resolve, reject ) {
		var answers = {};
		function onEach( x ) {
			answers[ x.name ] = x.answer;
			if ( onAnswer ) {
				onAnswer( x.name, x.answer );
			}
		}
		inquirer.prompt( prompts ).process.subscribe(
			onEach,
			reject, function() {
				resolve( answers );
			}
		);
	} );
};
