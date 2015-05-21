require( '../setup' );

var fs = {
	getDependencies: _.noop
};
var fsMock = sinon.mock( fs );

var drudgeonStub = sinon.stub();

var steps = {
	on: _.noop,
	run: _.noop
};
var stepsMock = sinon.mock( steps );

var npm = proxyquire( '../src/npm', {
	'./fs': fs,
	'drudgeon': drudgeonStub
} );

describe( 'NPM', function() {
	describe( 'with dependencies', function() {

		before( function() {
			fsMock.expects( 'getDependencies' )
				.resolves( {
					'lodash': '0.1.0',
					'hidash': '~0.55.0'
				} );
			drudgeonStub
				.withArgs( {
					'npm-libs': {
						'cwd': './',
						'cmd': {
							'win32': 'npm.cmd',
							'*': 'npm'
						},
						'args': [ 'install', 'lodash@0.1.0', 'hidash@~0.55.0' ]
					}
				} )
				.returns( steps );
			stepsMock.expects( 'run' )
				.resolves();
		} );

		it( 'should resolve without calls to anything else', function() {
			return npm.installModules( './' )
				.should.eventually.be.fulfilled;
		} );
	} );

	describe( 'without dependencies', function() {

		before( function() {
			fsMock.expects( 'getDependencies' )
				.resolves( {} );
			drudgeonStub
				.withArgs( {} )
				.returns( steps );
			stepsMock.expects( 'run' )
				.resolves();
		} );

		it( 'should resolve after completing install', function() {
			return npm.installModules( './' )
				.should.eventually.be.fulfilled;
		} );

	} );
} );
