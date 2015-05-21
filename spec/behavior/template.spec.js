require( '../setup' );
var path = require( 'path' );
var templates = require( '../../src/template' );

describe( 'Templates', function() {
	describe( 'with missing template', function() {
		var create;
		before( function() {
			create = templates.init( './spec/data' );
		} );

		it( 'should reject with error', function() {
			return create( 'two', 'template' )
				.should.eventually.be.rejectedWith( 'Could not load template "two/template" - please check that it is installed.' );
		} );
	} );


	describe( 'with valid template', function() {
		var template;
		before( function() {
			var create = templates.init( './spec/data' );
			return create( 'one', 'template' )
				.then( function( t ) {
					template = t;
				} );
		} );

		it( 'should have correct versions', function() {
			template.versions.should.eql( {
				'v0.0.5': path.resolve( './spec/data/one/template/v0.0.5' ),
				'v0.1.0': path.resolve( './spec/data/one/template/v0.1.0' ),
			} );
		} );

		it( 'should identify the latest version correctly', function() {
			template.latest.should.eql( 'v0.1.0' );
		} );

		describe( 'with valid version', function() {
			var version;
			before( function() {
				return template.loadVersion( 'v0.0.5' )
					.then( function( v ) {
						version = v;
					} );
			} );

			it( 'should load version', function() {
				version.should.eql( {
					commands: {
						before: {
							'npm-clear': {
								cwd: './',
								cmd: {
									win32: 'dir',
									'*': 'ls'
								},
								args: {
									win32: [ './node_modules' ],
									'*': [ '-al', './node_modules' ]
								}
							}
						},
						after: {
							'npm-dependencies': {
								cwd: './',
								cmd: {
									win32: 'npm.cmd',
									'*': 'npm'
								},
								args: [ 'install', 'autohost', 'hyped', 'when', 'lodash', 'fount' ]
							},
							'npm-libs': {
								cwd: './',
								cmd: {
									win32: 'npm.cmd',
									'*': 'npm'
								},
								args: [ 'install' ]
							},
						}
					},
					files: [
						path.resolve( './spec/data/one/template/v0.0.5/.gitignore' ),
						path.resolve( './spec/data/one/template/v0.0.5/.jshintrc' ),
						path.resolve( './spec/data/one/template/v0.0.5/README.md' ),
						path.resolve( './spec/data/one/template/v0.0.5/gulpfile.js' ),
						path.resolve( './spec/data/one/template/v0.0.5/package.json' ),
						path.resolve( './spec/data/one/template/v0.0.5/src/index.js' ),
					],
					path: path.resolve( './spec/data/one/template/v0.0.5' ),
					prompts: [
						{
							message: 'Project name',
							name: 'projectName',
							type: 'input'
						},
						{
							name: 'description',
							type: 'input',
							message: 'Project description'
						},
						{
							name: 'owner',
							type: 'input',
							message: 'GitHub Owner'
						},
						{
							name: 'author',
							type: 'input',
							message: 'NPM Author'
						}
					],
					items: {
						resource: {
							files: [
								path.resolve( './spec/data/one/template/v0.0.5/_items/resource/resource.js' )
							],
							path: path.resolve( './spec/data/one/template/v0.0.5/_items/resource' ),
							prompts: [
								{
									message: 'Resource name',
									name: 'resourceName',
									type: 'input'
								}
							],
							structure: {
								'./resource.js': './resources/${resourceName}/resource.js'
							}
						}
					}
				} );
			} );

			describe( 'with template fsm', function() {
				var drugeonBefore, expandArgs, prompts;
				before( function() {
					var drudgeonMock = function( set ) {
						drugeonBefore = set;
						return {
							on: _.noop,
							run: function() {
								return when.resolve();
							}
						};
					};
					var promptMock = function( set ) {
						prompts = set;
						return when.resolve(
							{
								projectName: 'test'
							}
						);
					};
					var expandMock = function() {
						expandArgs = Array.prototype.slice.call( arguments );
						return when.resolve();
					};

					var fn = proxyquire( '../src/template.fsm', {
						'drudgeon': drudgeonMock,
						'./expander': expandMock,
						'./prompt': promptMock
					} );
					var fsm = fn( './', version );
					return fsm.start();
				} );

				it( 'should process template', function() {
					drugeonBefore.should.eql( {
						'npm-dependencies': {
							cwd: './',
							cmd: {
								win32: 'npm.cmd',
								'*': 'npm'
							},
							args: [ 'install', 'autohost', 'hyped', 'when', 'lodash', 'fount' ]
						},
						'npm-libs': {
							cwd: './',
							cmd: {
								win32: 'npm.cmd',
								'*': 'npm'
							},
							args: [ 'install' ]
						},
					} );
					expandArgs.should.eql( [
						path.resolve( './spec/data/one/template/v0.0.5' ),
						'./',
						undefined,
						{
							projectName: 'test'
						},
						[
							path.resolve( './spec/data/one/template/v0.0.5/.gitignore' ),
							path.resolve( './spec/data/one/template/v0.0.5/.jshintrc' ),
							path.resolve( './spec/data/one/template/v0.0.5/README.md' ),
							path.resolve( './spec/data/one/template/v0.0.5/gulpfile.js' ),
							path.resolve( './spec/data/one/template/v0.0.5/package.json' ),
							path.resolve( './spec/data/one/template/v0.0.5/src/index.js' )
						],
						{}
					] );
					prompts.should.eql( [
						{
							message: 'Project name',
							name: 'projectName',
							type: 'input'
						},
						{
							name: 'description',
							type: 'input',
							message: 'Project description'
						},
						{
							name: 'owner',
							type: 'input',
							message: 'GitHub Owner'
						},
						{
							name: 'author',
							type: 'input',
							message: 'NPM Author'
						}
					] );
				} );
			} );
		} );
	} );
} );
