require( '../setup' );

describe( 'GitHub API integration', function() {
	var apiInstance, stubs, gh;

	beforeEach( function() {
		apiInstance = {
			authenticate: sinon.stub(),
			authorization: {
				create: sinon.stub().callsArg( 1 )
			}
		};

		stubs = {
			'github': function() {
				return apiInstance;
			}
		};

		gh = proxyquire( '../src/gh', stubs );
	} );


	describe( 'Creating an auth token', function() {
		it( 'should use basic authentication when requesting a token', function() {
			var options = {
				username: 'user',
				password: 'pass'
			};

			gh.createToken( options );

			apiInstance.authenticate.should.have.been.calledOnce.and.calledWith( {
				type: 'basic',
				username: options.username,
				password: options.password
			} );
		} );

		it( 'should call the authorization.create API', function() {
			gh.createToken( {} );

			var stub = apiInstance.authorization.create;
			var request = stub.lastCall.args[ 0 ];

			stub.should.have.been.calledOnce;
			request.scopes.should.eql( [ 'repo' ] );
			request.note.should.contain( 'Token obtained by blu' );
		} );

		describe( 'with two factor authentication', function() {
			it( 'should include the X-GitHub-OTP header', function() {
				var options = {
					username: 'user',
					password: 'pass',
					twoFactorToken: 'token'
				};

				gh.createToken( options );

				apiInstance.authorization.create.lastCall.args[ 0].headers[ 'X-GitHub-OTP' ].should.equal( options.twoFactorToken );
			} );
		} );
	} );

	describe( 'Authenticating with a token', function() {
		it( 'should call the authenticate API with the token', function() {
			var token = 'test';

			gh.authenticate( token );

			apiInstance.authenticate.should.have.been.calledOnce.and.calledWith( {
				type: 'oauth',
				token: token
			} );
		} );
	} );
} );
