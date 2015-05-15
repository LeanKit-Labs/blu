var inquirer = require( 'inquirer' );
var when = require( 'when' );
var _ = require( 'lodash' );

function getAnswers( prompts, onAnswer ) {
	return when.promise( function( resolve, reject ) {
		var answers = {};
		function onEach( x ) {
			answers[ x.name ] = x.answer;
			if ( onAnswer ) {
				onAnswer( x.name, x.answer );
			}
		}
		inquirer.prompt( prompts ).process.subscribe(
			onEach,
			reject, function() {
				resolve( answers );
			}
		);
	} );
}

function getDefaults() {
	return {
		before: function() {
			return {};
		},
		prompts: [],
		after: function( answers ) {
			return answers;
		}
	};
}

module.exports = function( prompts, onAnswer ) {
	var config;
	if ( _.isArray( prompts ) ) {
		config = _.merge( getDefaults(), { prompts: prompts } );
	} else {
		config = _.merge( getDefaults(), prompts );
	}

	function onAfter( merged, after ) {
		return _.merge( merged, after );
	}

	function onAnswers( beforeResult, answers ) {
		var merged = _.merge( beforeResult, answers );
		var after = config.after( merged );
		var cb = onAfter.bind( undefined, merged );

		if ( after.then ) {
			return after.then( cb );
		} else {
			return cb( after );
		}
	}

	function onBefore( result ) {
		return getAnswers( config.prompts, onAnswer )
			.then( onAnswers.bind( undefined, result ) );
	}

	var before = config.before();
	if ( before.then ) {
		return before
			.then( onBefore );
	} else {
		return onBefore( before );
	}
};
