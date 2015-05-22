var _ = require( 'lodash' );
var drudgeon = require( 'drudgeon' );
var fs = require( './fs' );

function installModules( release ) {
	console.log( 'Installing modules for', release );
	return fs.getDependencies( release )
		.then( onDependencies.bind( undefined, release ) );
}

function onDependencies( release, dependencies ) {
	if ( _.isEmpty( dependencies ) ) {
		return release;
	} else {
		var args = _.reduce( dependencies, function( acc, version, lib ) {
			acc.push( [ lib, version ].join( '@' ) );
			return acc;
		}, [ 'install' ] );
		var steps = drudgeon( {
			'npm-libs': {
				'cwd': release,
				'cmd': {
					'win32': 'npm.cmd',
					'*': 'npm'
				},
				'args': args
			}
		} );
		steps.on( 'starting.#', function( x ) {
			console.log( 'installing template prerequisites:', x );
		} );
		return steps.run()
			.then( function() {
				return release;
			} );
	}
}

module.exports = {
	installModules: installModules
};
