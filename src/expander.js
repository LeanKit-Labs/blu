var fs = require( 'fs' );
var path = require( 'path' );
var when = require( 'when' );
var lift = require( 'when/node' ).lift;
var _ = require( 'lodash' );
var mkdirp = require( 'mkdirp' );

var defaultContext = {
	'_': _
};

function expand( base, target, context, state, files, structure ) {
	var imports = _.merge( {}, defaultContext, context );
	var dirMap = _.reduce( structure || {}, function( acc, p, k ) {
		var fn = _.template( p, imports );
		acc[ k ] = fn( state );
		return acc;
	}, {} );

	function onContent( file, content ) {
		var partial = file.replace( base, '.' );
		var newPath = dirMap[ partial ]
			? path.join( target, dirMap[ partial ] )
			: path.join( target, partial );
		var dir = path.dirname( newPath );
		var fn = _.template( content, imports );
		var expanded = fn( state );
		if ( !fs.existsSync( dir ) ) {
			mkdirp.sync( dir );
		}
		return lift( fs.writeFile )( newPath, expanded );
	}

	var promises = _.map( files, function( file ) {
		return lift( fs.readFile )( file )
			.then( onContent.bind( undefined, file ) );
	} );
	return when.all( promises );
}

module.exports = expand;
