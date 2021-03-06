var fs = require( 'fs' );
var when = require( 'when' );
var lift = require( 'when/node' ).lift;
var inquirer = require( 'inquirer' );
var path = require( 'path' );
var tokenPath = path.join( process.env.HOME,  '.blu/.api-token' );
var api = require( './gh' );
var tokenValue = "";

function createToken() {
	return promptUser().then( api.createToken ).then( writeToken );
}

function getToken() {
	if ( !tokenValue && fs.existsSync( tokenPath ) ) {
		tokenValue = fs.readFileSync( tokenPath );
	}

	return tokenValue;
}

function promptUser() {
	return when.promise( function( resolve ) {
		inquirer.prompt( [
			{
				type: 'input',
				name: 'username',
				message: 'GitHub Username'
			},
			{
				type: 'password',
				name: 'password',
				message: 'GitHub Password'
			},
			{
				type: 'input',
				name: 'twoFactorToken',
				message: '2FA token (enter if your user uses two-factor authentication)'
			}
		], resolve );
	} );
}

function writeToken( doc ) {
	return lift( fs.writeFile )( tokenPath, doc.token );
}

var accessToken = {
	create: createToken
};

Object.defineProperty( accessToken, 'value', {
	enumerable: true,
	get: getToken
} );

module.exports = accessToken;
