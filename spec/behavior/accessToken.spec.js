require( '../setup' );

var path = require( 'path' );

describe( 'Access tokens', function() {
	var stubs, accessToken;

	var tokenReadValue = "readValue";

	var promptResponse = {
		username: 'testUser',
		password: 'testPassword',
		twoFactorToken: 'testToken'
	};

	var tokenResponse = {
		token: 'tokenValue'
	};

	before( function() {
		stubs = {
			fs: {
				existsSync: sinon.stub().returns( true ),
				readFileSync: sinon.stub().returns( tokenReadValue ),
				writeFile: sinon.stub().callsArg( 2 )
			},
			inquirer: {
				prompt: sinon.stub().callsArgWith( 1, promptResponse )
			},
			'./gh': {
				createToken: sinon.stub().resolves( tokenResponse )
			}
		};

		accessToken = proxyquire( '../src/accessToken', stubs );
	} );


	describe( "Creating an auth token", function() {
		before( function() {
			return accessToken.create().should.eventually.be.fulfilled;
		} );

		it( 'should prompt the user', function() {
			stubs.inquirer.prompt.should.have.been.calledOnce;
		} );

		it( 'should call the API to create a token with the prompt results', function() {
			stubs[ './gh' ].createToken.should.have.been.calledOnce.and.calledWith( promptResponse );
		} );

		it( 'should write the token to the filesystem', function() {
			stubs.fs.writeFile.calledWith( tokenResponse );
		} );
	} );

	describe( 'Retrieving the auth token value', function() {
		it( 'should load the token from the filesystem on first access', function() {
			accessToken.value.should.equal( tokenReadValue );
			stubs.fs.readFileSync.should.be.calledOnce.and.calledWith( path.join( process.env.HOME,  '.blu/.api-token' ) );
		} );

		it( 'should return a cached value, if previously loaded from the filesystem', function() {
			accessToken.value.should.equal( tokenReadValue );
			// still only called once
			stubs.fs.readFileSync.should.be.calledOnce;
		} );

		it( 'should return an empty string, if there is no file', function() {
			accessToken = proxyquire( '../src/accessToken', {
				fs: {
					existsSync: sinon.stub().returns( false )
				}
			} );

			accessToken.value.should.equal( '' );
		} );
	} );
} );
