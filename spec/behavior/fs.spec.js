require( '../setup' );
var path = require( 'path' );
var removed;
var exists = false;

var rename = sinon.stub();

var fs = proxyquire( '../src/fs', {
	rimraf: function( remove, cb ) {
		removed = remove;
		cb();
	},
	fs: {
		exists: function( x, cb ) {
			cb( true );
		},
		existsSync: function() {
			return exists;
		},
		rename: rename
	}
} );

describe( 'File System', function() {
	describe( 'when finding directories', function() {
		var list;
		before( function() {
			return fs.listDirectories( path.resolve( './spec' ) )
				.then( function( result ) {
					list = result;
				} );
		} );

		it( 'should only return immediate subdirectories', function() {
			list.should.eql( [ 'behavior', 'data', 'integration' ] );
		} );
	} );

	describe( 'when finding files', function() {
		var list;
		before( function() {
			return fs.listFiles( path.resolve( './spec/data/one/template/v0.0.5' ) )
				.then( function( result ) {
					list = result;
				} );
		} );

		it( 'should list all files', function() {
			list.should.eql( [
				path.resolve( './spec/data/one/template/v0.0.5/.commands.json' ),
				path.resolve( './spec/data/one/template/v0.0.5/.gitignore' ),
				path.resolve( './spec/data/one/template/v0.0.5/.jshintrc' ),
				path.resolve( './spec/data/one/template/v0.0.5/.prompt.js' ),
				path.resolve( './spec/data/one/template/v0.0.5/README.md' ),
				path.resolve( './spec/data/one/template/v0.0.5/_items/resource/.prompt.js' ),
				path.resolve( './spec/data/one/template/v0.0.5/_items/resource/.structure.json' ),
				path.resolve( './spec/data/one/template/v0.0.5/_items/resource/resource.js' ),
				path.resolve( './spec/data/one/template/v0.0.5/_support/.dependencies.json' ),
				path.resolve( './spec/data/one/template/v0.0.5/_support/utility.js' ),
				path.resolve( './spec/data/one/template/v0.0.5/gulpfile.js' ),
				path.resolve( './spec/data/one/template/v0.0.5/package.json' ),
				path.resolve( './spec/data/one/template/v0.0.5/src/index.js' )
			] );
		} );
	} );

	describe( 'when listing installs', function() {
		it( 'should create a datastructure containing installed repos and versions', function() {
			return fs.listInstalls( path.resolve( './spec/data' ) )
				.should.eventually.eql( {
				one: {
					template: [
						'v0.0.5',
						'v0.1.0'
					]
				}
			} );
		} );
	} );

	describe( 'when getting template dependencies', function() {
		it( 'should return dependency hash', function() {
			return fs.getDependencies( path.resolve( './spec/data/one/template/v0.0.5' ) )
				.should.eventually.eql( {
				'lodash': '*',
				'pluralize': '*'
			} );
		} );
	} );

	//  parent, owner, repo, version
	describe( 'when removing version', function() {
		it( 'should remove specific version only', function() {
			exists = true;
			return fs.removeTemplate( '/target', 'owner', 'repo', 'v0.1.1' )
				.then( function() {
					return removed;
				} ).should.eventually.equal( '/target/owner/repo/v0.1.1' );
		} );

		after( function() {
			exists = false;
			removed = undefined;
		} );
	} );

	describe( 'when removing all', function() {
		it( 'should remove project folder', function() {
			exists = true;
			return fs.removeTemplate( '/target', 'owner', 'repo' )
				.then( function() {
					return removed;
				} ).should.eventually.equal( '/target/owner/repo' );
		} );

		after( function() {
			exists = false;
			removed = undefined;
		} );
	} );

	describe( 'when removing missing', function() {
		it( 'should report error', function() {
			exists = false;
			return fs.removeTemplate( '/target', 'owner', 'repo' )
				.should.eventually.be.rejectedWith(
				'Cannot remove template for owner/repo because it has not been installed'
			);
		} );

		after( function() {
			exists = false;
			removed = undefined;
		} );
	} );

	describe( 'when moving package file', function() {
		var oldPath = '/project/location/_support/package.json';
		var newPath = '/project/location/package.json';
		before( function() {
			rename
				.withArgs( oldPath, newPath, sinon.match.any )
				.callsArg( 2 )
				.resolves();
		} );

		it( 'should move the file to the correct location', function() {
			return fs.movePackage( '/project/location' )
				.should.eventually.be.fulfilled;
		} );

		it( 'should have called stub', function() {
			sinon.assert.calledOnce( rename );
			sinon.assert.calledWith( rename, oldPath, newPath, sinon.match.any );
		} );
	} );
} );
