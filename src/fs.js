var fs = require( 'fs' );
var path = require( 'path' );
var _ = require( 'lodash' );
var when = require( 'when' );
var lift = require( 'when/node' ).lift;
var util = require( 'util' );
var rimraf = require( 'rimraf' );
var PACKAGE = 'package.json';

function movePackage( current ) {
	var packageFile = path.join( path.resolve( current ), '_support', PACKAGE );
	var projectPath = path.dirname( packageFile );
	var projectLocation = path.resolve( projectPath, '../', PACKAGE );
	return when.promise( function( resolve ) {
		fs.exists( packageFile, function( exists ) {
			if ( exists ) {
				lift( fs.rename )( packageFile, projectLocation )
					.then( function() {
						resolve( current );
					} );
			} else {
				resolve( current );
			}
		} );
	} );
}

function listDirectories( parent ) {
	parent = parent.replace( /~/, process.env.HOME );
	function filterDir( file, stat ) {
		return stat.isDirectory() ? file : undefined;
	}
	function onFile( file ) {
		var fullPath = path.join( parent, file );
		return lift( fs.stat )( fullPath )
			.then( filterDir.bind( undefined, file ) );
	}
	function onFiles( files ) {
		return when.all( _.map( files, onFile ) )
			.then( _.filter );
	}
	return lift( fs.readdir )( parent )
		.then( onFiles );
}

function getDependencies( current ) {
	var dependencies = path.join( path.resolve( current ), '_support', '.dependencies.json' );
	return when.promise( function( resolve ) {
		fs.exists( dependencies, function( exists ) {
			if ( exists ) {
				resolve( require( dependencies ) );
			} else {
				resolve( {} );
			}
		} );
	} );
}

function getTree( current, depth ) {
	function fork( file, stat ) {
		if ( file === '.git' ) {
			return undefined;
		} else if ( stat.isDirectory() ) {
			var filePath = path.join( current, file );
			return depth === 1 ? filePath : getTree( filePath, depth - 1 );
		} else {
			return undefined;
		}
	}
	function onFile( file ) {
		var fullPath = path.join( current, file );
		return lift( fs.stat )( fullPath )
			.then( fork.bind( undefined, file ) );
	}
	function onFiles( files ) {
		return when.all( _.map( files, onFile ) )
			.then( _.flatten )
			.then( _.filter );
	}
	return lift( fs.readdir )( current )
		.then( onFiles );
}

function listFiles( current ) {
	function fork( file, stat ) {
		if ( stat.isDirectory() ) {
			return file === '.git' ? undefined : listFiles( path.join( current, file ) );
		} else {
			return path.join( current, file );
		}
	}
	function onFile( file ) {
		var fullPath = path.join( current, file );
		return lift( fs.stat )( fullPath )
			.then( fork.bind( undefined, file ) );
	}
	function onFiles( files ) {
		return when.all( _.map( files, onFile ) )
			.then( _.flatten )
			.then( _.filter );
	}
	return lift( fs.readdir )( current )
		.then( onFiles );
}

function listInstalls( root ) {
	root = root.replace( /~/, process.env.HOME );
	return getTree( root, 3 )
		.then( function( versions ) {
			return _.reduce( versions, function( acc, version ) {
				version = version.replace( root, '' );
				var parts = version.split( path.sep ).slice( 1 );
				var owner = acc[ parts[ 0 ] ] = acc[ parts[ 0 ] ] || {};
				var project = owner[ parts[ 1 ] ] = owner[ parts[ 1 ] ] || [];
				project.push( parts[ 2 ] );
				return acc;
			}, {} );
		} );
}

function removeTemplate( parent, owner, repo, version ) {
	parent = parent.replace( /~/, process.env.HOME );
	var target = path.join( parent, owner, repo, version || '' );
	if ( fs.existsSync( target ) ) {
		return lift( rimraf )( target );
	}
	return when.reject(
		new Error( util.format(
			'Cannot remove template for %s/%s because it has not been installed',
			owner,
			repo
		)
		) );
}

module.exports = {
	getDependencies: getDependencies,
	listDirectories: listDirectories,
	listFiles: listFiles,
	listInstalls: listInstalls,
	movePackage: movePackage,
	removeTemplate: removeTemplate
};
