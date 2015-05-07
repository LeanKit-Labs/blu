var util = require( 'util' );
var _ = require( 'lodash' );
var nodeFS = require( 'fs' );
var fs = require( './fs' );
var path = require( 'path' );
var mkdirp = require( 'mkdirp' );
var when = require( 'when' );
var semver = require( 'semver' );

function init( base ) {
	base = base.replace( /~/, process.env.HOME );
	var basePath = path.resolve( base );
	if ( !nodeFS.existsSync( basePath ) ) {
		mkdirp.sync( base );
	}
	return createTemplate.bind( undefined, basePath );
}

function attachFile( target, file ) {
	if ( /[.]prompt.js$/.test( file ) ) {
		target.prompts = require( file );
	} else if ( /[\/][.]structure.json$/.test( file ) ) {
		target.structure = require( file );
	} else if ( /[\/][.]commands.json$/.test( file ) ) {
		target.commands = require( file );
	} else if ( /[\/][.]context.js$/.test( file ) ) {
		target.context = require( file );
	} else if ( /[\/][_]support/.test( file ) ) {
		// ignored files
		void ( 0 );
	} else {
		target.files = target.files || [];
		target.files.push( file );
	}
}

function loadVersion( owner, repo, versionPaths, version ) {
	var versionPath = versionPaths[ version ];
	if ( !versionPath ) {
		var error = version ?
			new Error( util.format(
				'Version "%s" is not installed for "%s/%s"',
				version,
				owner,
				repo
			) ) :
			new Error( util.format(
				'No installed versions exist for for "%s/%s"',
				version,
				owner,
				repo
			) );
		return when.reject( error );
	}
	return fs.listFiles( versionPath )
		.then( function( files ) {
			return _.reduce( files, function( acc, file ) {
				if ( /[\/][_]items/.test( file ) ) {
					acc.items = acc.items || {};
					var itemName = /[_]items[\/]([a-zA-Z0-9 ]*)/.exec( file )[ 1 ];
					var item = acc.items[ itemName ] || {
						path: path.join( versionPath, '_items', itemName )
					};
					acc.items[ itemName ] = item;
					attachFile( item, file );
				} else {
					attachFile( acc, file );
				}
				return acc;
			}, { path: versionPath } );
		} );
}

function createTemplate( base, owner, repo ) {
	var templatePath = path.join( base, owner, repo );
	function onError() {
		return when.reject( new Error( util.format( 'Could not load template "%s/%s" - please check that it is installed.', owner, repo ) ) );
	}
	function onVersions( versions ) {
		var versionPaths = _.reduce( versions, function( acc, version ) {
			acc[ version ] = path.join( templatePath, version );
			return acc;
		}, {} );
		return {
			base: templatePath,
			owner: owner,
			repo: repo,
			latest: versions.sort( semver.rcompare )[ 0 ],
			versions: versionPaths,
			loadVersion: loadVersion.bind( undefined, owner, repo, versionPaths )
		};
	}
	return fs.listDirectories( templatePath )
		.then( onVersions, onError );
}

module.exports = {
	init: init,
	create: createTemplate
};
