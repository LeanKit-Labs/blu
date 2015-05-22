var when = require( 'when' );
var lift = require( 'when/node' ).lift;
var Api = require( 'github' );
var request = require( 'request' );
var fs = require( 'fs' );
var path = require( 'path' );
var mkdirp = require( 'mkdirp' );
var _ = require( 'lodash' );
var tar = require( 'tar' );
var zlib = require( 'zlib' );

var github = new Api( {
	version: '3.0.0',
	protocol: 'https',
	timeout: 5000,
	headers: {
		'user-agent': 'blu'
	}
} );

function authenticateToken( token ) {
	github.authenticate( {
		type: 'oauth',
		token: token
	} );
}

function authenticateBasic( username, password ) {
	github.authenticate( {
		type: 'basic',
		username: username,
		password: password
	} );
}

function createToken( options ) {
	authenticateBasic( options.username, options.password );

	var request = {
		scopes: [ 'repo' ],
		note: 'Token obtained by blu on ' + new Date().toLocaleString()
	};

	if ( options.twoFactorToken ) {
		request.headers = {
			'X-GitHub-OTP': options.twoFactorToken
		};
	}

	return lift( github.authorization.create )( request );
}

function getReleaseList( owner, repo ) {
	return lift( github.repos.getTags )(
		{
			user: owner,
			repo: repo,
			per_page: 100
		}
	).then( function( results ) {
		return _.map( results, function( r ) {
			return { version: r.name, url: r.tarball_url };
		} );
	} );
}

function downloadRelease( target, owner, project, tag, url, twoFactorToken ) {
	target = target.replace( /~/, process.env.HOME );
	var dir = path.join( path.resolve( target ), owner, project, tag );
	var file = path.join( dir, 'release.tar.gz' );
	return when.promise( function( resolve, reject ) {
		mkdirp.sync( dir );
		var resolved = false;
		function done() {
			if ( !resolved ) {
				resolved = true;
				resolve( { dir: dir, file: file } );
			}
		}

		var headers = {
			'user-agent': 'blu'
		};

		if ( twoFactorToken ) {
			headers.Authorization = 'token ' + twoFactorToken;
		}

		request( {
			url: url,
			headers: headers
		} )
			.pipe( fs.createWriteStream( file ) )
			.on( 'error', function( err ) {
				reject( err );
			} )
			.on( 'close', done )
			.on( 'end', done );
	} );
}

function extractRelease( release ) {
	return when.promise( function( resolve, reject ) {
		fs.createReadStream( release.file )
			.pipe( zlib.createGunzip() )
			.pipe( tar.Extract( { path: release.dir, strip: 1 } ) )
			.on( 'error', function( err ) {
				reject( err );
			} )
			.on( 'end', function() {
				fs.unlinkSync( release.file );
				resolve( release.dir );
			} );
	} );
}

module.exports = {
	authenticate: authenticateToken,
	createToken: createToken,
	getList: getReleaseList,
	download: downloadRelease,
	extract: extractRelease
};
