require( '../setup' );

var path = require( 'path' );

describe( 'Auth tokens', function() {
	var stubs, authToken;

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

		authToken = proxyquire( '../src/authToken', stubs );
	} );


	describe( "Creating an auth token", function() {
		before( function() {
			return authToken.create().should.eventually.be.fulfilled;
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
			authToken.value.should.equal( tokenReadValue );
			stubs.fs.readFileSync.should.be.calledOnce.and.calledWith( path.join( process.env.HOME,  '.blu/.api-token' ) );
		} );

		it( 'should return a cached value, if previously loaded from the filesystem', function() {
			authToken.value.should.equal( tokenReadValue );
			// still only called once
			stubs.fs.readFileSync.should.be.calledOnce;
		} );

		it( 'should return an empty string, if there is no file', function() {
			authToken = proxyquire( '../src/authToken', {
				fs: {
					existsSync: sinon.stub().returns( false )
				}
			} );

			authToken.value.should.equal( '' );
		} );
	} );
} );
