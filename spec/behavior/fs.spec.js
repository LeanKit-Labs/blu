require( '../setup' );
var path = require( 'path' );
var removed;
var exists = false;

var fs = proxyquire( '../src/fs', {
	rimraf: function( remove, cb ) {
		removed = remove;
		cb();
	},
	fs: {
		existsSync: function() {
			return exists;
		}
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
				path.resolve( './spec/data/one/template/v0.0.5/_support/utility.js' ),
				path.resolve( './spec/data/one/template/v0.0.5/gulpfile.js' ),
				path.resolve( './spec/data/one/template/v0.0.5/package.json' ),
				path.resolve( './spec/data/one/template/v0.0.5/src/index.js' )
			] );
		} );
	} );

	describe( 'when getting commands', function() {
		var list;
		before( function() {
			return fs.getCommands( path.resolve( './spec/data/one/template/v0.0.5' ) )
				.then( function( result ) {
					list = result;
				} );
		} );

		it( 'should return command files only', function() {
			list.should.eql( [
				path.resolve( './spec/data/one/template/v0.0.5/.commands.json' )
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
} );
