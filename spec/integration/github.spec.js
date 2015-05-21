require( '../setup' );
var fs = require( 'fs' );
var rimraf = require( 'rimraf' );
var releases = require( '../../src/gh' );

describe( 'GitHub Integration', function() {
	describe( 'when getting a list of releases', function() {
		var list;
		before( function() {
			this.timeout( 5000 );
			return releases.getList( 'LeanKit-Labs', 'wascally' )
				.then( function( result ) {
					list = result;
				} );
		} );

		it( 'should return a list of releases', function() {
			list.length.should.be.greaterThan( 20 );
		} );

		describe( 'when downloading latest release', function() {
			var download;
			before( function() {
				this.timeout( 5000 );
				var latest = list[ 0 ];
				var version = latest.version;
				var url = latest.url;
				return releases.download( './downloads', 'leankit-labs', 'wascally', version, url )
					.then( function( result ) {
						download = result;
						return releases.extract( result );
					} );
			} );

			it( 'should download file correctly', function() {
				fs.existsSync( download.file );
			} );

			after( function() {
				rimraf.sync( './downloads' );
			} );
		} );
	} );
} );
