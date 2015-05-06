var _ = require( 'lodash' );
var machina = require( 'machina' );
var when = require( 'when' );
var drudgeon = require( 'drudgeon' );
var prompt = require( './prompt' );
var expand = require( './expander' );

function createFsm( targetPath, template ) {
	return new machina.Fsm( {
			initialize: function() {
				this.steps = [];
				if ( template.commands && !_.isEmpty( template.commands.before ) ) {
					this.steps.push( 'pre' );
				}
				if ( template.prompts && template.prompts.length > 0 ) {
					this.steps.push( 'prompt' );
				}
				if ( template.files ) {
					this.steps.push( 'expand' );
				}
				if ( template.commands && !_.isEmpty( template.commands.after ) ) {
					this.steps.push( 'post' );
				}
			},

			next: function() {
				if ( this.steps.length ) {
					this.transition( this.steps.shift() );
				} else {
					this.deferred.resolve();
				}
			},

			reject: function( step, err ) {
				this.deferred.reject(
					{ step: step, error: err }
				);
			},

			setAnswers: function( answers ) {
				this.answers = answers;
				process.nextTick( function() {
					this.next();
				}.bind( this ) );
			},

			start: function() {
				this.deferred = when.defer();
				this.next();
				return this.deferred.promise;
			},

			initialState: 'initialize',
			states: {
				initialize: {},
				pre: {
					'_onEnter': function() {
						var steps = drudgeon( template.commands.before );
						steps.on( 'starting.#', function( x ) {
							console.log( 'starting pre-expand step:', x );
						} );
						steps.run()
							.then(
								this.next.bind( this ),
								this.reject.bind( this, 'pre' ) );
					}
				},
				prompt: {
					'_onEnter': function() {
						prompt( template.prompts )
							.then(
								this.setAnswers.bind( this ),
								this.reject.bind( this, 'prompt' )
						);
					}
				},
				expand: {
					'_onEnter': function() {
						console.log( 'Expanding', template.files.length, 'files' );
						expand(
							template.path,
							targetPath,
							template.context,
							this.answers,
							template.files,
							template.structure || {}
						).then(
							this.next.bind( this ),
							this.reject.bind( this, 'expand' )
						);
					}
				},
				post: {
					'_onEnter': function() {
						var steps = drudgeon( template.commands.after );
						steps.on( 'starting.#', function( x ) {
							console.log( 'starting post-expand step:', x );
						} );
						steps.run()
							.then(
								this.next.bind( this ),
								this.reject.bind( this, 'post' ) );
					}
				}
			}
		} );
}

module.exports = createFsm;
