var chai = require( 'chai' );
chai.use( require( 'chai-as-promised' ) );
chai.use( require( 'sinon-chai' ) );
global.should = chai.should();
global.expect = chai.expect;
global._ = require( 'lodash' );
global.fs = require( 'fs' );
global.sinon = require( 'sinon' );
global.when = require( 'when' );
require( 'sinon-as-promised' );
global.proxyquire = require( 'proxyquire' ).noPreserveCache();

var _log = console.log;
console.log = function() {
	if ( typeof arguments[ 0 ] === 'string' && /^[a-zA-Z]/.test( arguments[ 0 ] ) ) {
		return; // swallow this message
	} else {
		_log.apply( console, arguments );
	}
};
