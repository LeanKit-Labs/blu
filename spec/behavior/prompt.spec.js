require( '../setup' );

var inquireMock = {
	prompt: _.noop
};

var mock = sinon.mock( inquireMock );

var prompt = proxyquire( '../src/prompt', {
	'inquirer': inquireMock
} );

function getSubscription( answers ) {
	return {
		process: {
			subscribe: function( onEach, reject, done ) {
				_.each( answers, function( v, k ) {
					onEach( { name: k, answer: v } );
				} );
				done();
			}
		}
	};
}

describe( 'Prompts', function() {
	describe( 'without before or after', function() {
		var opts = {
			prompts: [
				{
					name: 'test',
					type: 'input',
					message: 'test'
				}
			]
		};

		before( function() {
			mock.expects( 'prompt' )
				.withArgs( opts.prompts )
				.returns( getSubscription( { test: 'heyo' } ) );
		} );

		it( 'should get prompt answer back', function() {
			return prompt( opts )
				.should.eventually.eql( { test: 'heyo' } );
		} );
	} );

	describe( 'with before value', function() {
		var opts = {
			before: function() {
				return { before: 'first' };
			},
			prompts: [
				{
					name: 'test',
					type: 'input',
					message: 'test'
				}
			]
		};

		before( function() {
			mock.expects( 'prompt' )
				.withArgs( opts.prompts )
				.returns( getSubscription( { test: 'heyo' } ) );
		} );

		it( 'should get prompt answer back', function() {
			return prompt( opts )
				.should.eventually.eql( { test: 'heyo', before: 'first' } );
		} );
	} );

	describe( 'with before promise', function() {
		var opts = {
			before: function() {
				return when.resolve( { test: 'overwritten', before: 'first' } );
			},
			prompts: [
				{
					name: 'test',
					type: 'input',
					message: 'test'
				}
			]
		};

		before( function() {
			mock.expects( 'prompt' )
				.withArgs( opts.prompts )
				.returns( getSubscription( { test: 'heyo' } ) );
		} );

		it( 'should get prompt answer back', function() {
			return prompt( opts )
				.should.eventually.eql( { test: 'heyo', before: 'first' } );
		} );
	} );

	describe( 'with after value', function() {
		var opts = {
			prompts: [
				{
					name: 'test',
					type: 'input',
					message: 'test'
				}
			],
			after: function() {
				return { test: 'overwrite' };
			}
		};

		before( function() {
			mock.expects( 'prompt' )
				.withArgs( opts.prompts )
				.returns( getSubscription( { test: 'heyo' } ) );
		} );

		it( 'should get prompt answer back', function() {
			return prompt( opts )
				.should.eventually.eql( { test: 'overwrite' } );
		} );
	} );

	describe( 'with after promise', function() {
		var opts = {
			prompts: [
				{
					name: 'test',
					type: 'input',
					message: 'test'
				}
			],
			after: function() {
				return when.resolve( { after: 'newval' } );
			}
		};

		before( function() {
			mock.expects( 'prompt' )
				.withArgs( opts.prompts )
				.returns( getSubscription( { test: 'heyo' } ) );
		} );

		it( 'should get prompt answer back', function() {
			return prompt( opts )
				.should.eventually.eql( { test: 'heyo', after: 'newval' } );
		} );
	} );

	after( function() {
		mock.restore();
	} );
} );
