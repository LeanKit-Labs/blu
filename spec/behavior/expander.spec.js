require( '../setup' );
var path = require( 'path' );

var written = {
};

function clear() {
	written = {};
}

function write( target, content, cb ) {
	written[ target ] = content;
	cb();
}

var expand = proxyquire( '../src/expander', {
	fs: {
		writeFile: write
	},
	mkdirp: {
		sync: function() {
			return when.resolve();
		}
	}
} );

describe( 'Expanding Templates', function() {
	var files;
	before( function() {
		files = [
			path.resolve( './spec/data/one/template/v0.0.5/.gitignore' ),
			path.resolve( './spec/data/one/template/v0.0.5/.jshintrc' ),
			path.resolve( './spec/data/one/template/v0.0.5/README.md' ),
			path.resolve( './spec/data/one/template/v0.0.5/gulpfile.js' ),
			path.resolve( './spec/data/one/template/v0.0.5/package.json' ),
			path.resolve( './spec/data/one/template/v0.0.5/src/index.js' )
		];
	} );

	describe( 'with required template data', function() {
		before( function() {
			return expand(
				path.resolve( './spec/data/one/template/v0.0.5' ),
				'/target',
				undefined,
				{
					projectName: 'test-project',
					description: 'this is a description',
					owner: 'test-owner',
					author: 'test-author'
				},
				files
			);
		} );

		it( 'should write all files from the template repository', function() {
			written.should.eql( {
				'/target/.gitignore': 'node_modules/\n.idea/\n.DS_Store\n*npm-debug.log\nlog/\n*.swp\n*.swo\ncoverage/\nplato/\n',
				'/target/.jshintrc': '{\n	// http://www.jshint.com/docs/\n	// Based on node-jshint@0.9.1\n\n	// ENFORCING OPTIONS\n	// These options tell JSHint to be more strict towards your code. Use them if\n	// you want to allow only a safe subset of JavaScript—very useful when your\n	// codebase is shared with a big number of developers with different skill\n	// levels.\n\n	"bitwise"   : true,   //prohibits the use of bitwise operators such as ^ (XOR), | (OR) and others\n	"camelcase" : true,   //force all variable names to use either camelCase style or UPPER_CASE with underscores\n	"curly"     : true,   //requires you to always put curly braces around blocks in loops and conditionals\n	"eqeqeq"    : true,   //prohibits the use of == and != in favor of === and !==\n	"forin"     : true,   //requires all `for in` loops to filter object\'s items with `hasOwnProperty()`\n	"immed"     : true,   //prohibits the use of immediate function invocations without wrapping them in parentheses\n	"indent"    : 4,      //enforces specific tab width\n	"latedef"   : "nofunc",   //prohibits the use of a variable before it was defined\n	"newcap"    : true,   //requires you to capitalize names of constructor functions\n	"noarg"     : true,   //prohibits the use of `arguments.caller` and `arguments.callee`\n	"noempty"   : true,   //warns when you have an empty block in your code\n	"nonew"     : true,   //prohibits the use of constructor functions for side-effects\n	"plusplus"  : false,  //prohibits the use of unary increment and decrement operators\n	"quotmark"  : true,   //enforces the consistency of quotation marks used throughout your code\n	"regexp"    : false,  //prohibits the use of unsafe `.` in regular expressions\n	"undef"     : true,   //prohibits the use of explicitly undeclared variables\n	"unused"    : true,   //warns when you define and never use your variables\n	"strict"    : false,  //requires all functions to run in EcmaScript 5\'s strict mode\n	"trailing"  : false,  //makes it an error to leave a trailing whitespace in your code\n	// "maxparams":      0,      //set the max number of formal parameters allowed per function,\n	// "maxdepth":       0,      //control how nested do you want your blocks to be\n	// "maxstatements":  0,      //set the max number of statements allowed per function\n	// "maxcomplexity":  0,      //control cyclomatic complexity throughout your code\n	// "maxlen":         80,     //set the maximum length of a line\n\n	// RELAXING OPTIONS\n	// These options allow you to suppress certain types of warnings. Use them\n	// only if you are absolutely positive that you know what you are doing.\n\n	"asi"          : false,  //suppresses warnings about missing semicolons\n	"boss"         : true,   //suppresses warnings about the use of assignments in cases where comparisons are expected\n	"debug"        : false,  //suppresses warnings about the debugger statements in your code\n	"eqnull"       : false,  //suppresses warnings about == null comparisons\n	"es5"          : false,  //your code uses ECMAScript 5 specific features such as getters and setters\n	"esnext"       : false,  //your code uses ES.next specific features such as const\n	"evil"         : false,  //suppresses warnings about the use of eval\n	"expr"         : false,  //suppresses warnings about the use of expressions where normally you would expect to see assignments or function calls\n	"funcscope"    : false,  //suppresses warnings about declaring variables inside of control structures while accessing them later from the outside\n	"globalstrict" : false,  //suppresses warnings about the use of global strict mode\n	"iterator"     : false,  //suppresses warnings about the `__iterator__` property\n	"lastsemic"    : false,  //suppresses warnings about missing semicolons, but only when the semicolon is omitted for the last statement in a one-line block\n	"laxbreak"     : true,  //suppresses most of the warnings about possibly unsafe line breakings in your code\n	"laxcomma"     : false,  //suppresses warnings about comma-first coding style\n	"loopfunc"     : false,  //suppresses warnings about functions inside of loops\n	"multistr"     : false,  //suppresses warnings about multi-line strings\n	"onecase"      : false,  //suppresses warnings about switches with just one case\n	"proto"        : false,  //suppresses warnings about the `__proto__` property\n	"regexdash"    : true,   //suppresses warnings about unescaped `-` in the end of regular expressions\n	"scripturl"    : false,  //suppresses warnings about the use of script-targeted URLs—such as `javascript:...`\n	"smarttabs"    : true,   //suppresses warnings about mixed tabs and spaces when the latter are used for alignmnent only\n	"shadow"       : false,  //suppresses warnings about variable shadowing\n	"sub"          : false,  //suppresses warnings about using `[]` notation when it can be expressed in dot notation\n	"supernew"     : false,  //suppresses warnings about "weird" constructions like `new function () { ... }` and `new Object;`\n	"validthis"    : false,  //suppresses warnings about possible strict violations when the code is running in strict mode and you use `this` in a non-constructor function\n\n	// ENVIRONMENTS\n	// These options pre-define global variables that are exposed by popular\n	// JavaScript libraries and runtime environments—such as browser or node.js.\n	// Essentially they are shortcuts for explicit declarations like\n	// /*global $:false, jQuery:false */\n\n	"browser"     : true,   //defines globals exposed by modern browsers\n	"couch"       : false,  //defines globals exposed by CouchDB\n	"devel"       : true,   //defines globals that are usually used for logging poor-man\'s debugging: `console`, `alert`, etc.\n	"dojo"        : false,  //defines globals exposed by the Dojo Toolkit\n	"jquery"      : false,  //defines globals exposed by the jQuery JavaScript library\n	"mootools"    : false,  //defines globals exposed by the MooTools JavaScript framework\n	"node"        : true,   //defines globals available when your code is running inside of the Node runtime environment\n	"nonstandard" : true,   //defines non-standard but widely adopted globals such as `escape` and `unescape`\n	"prototypejs" : false,  //defines globals exposed by the Prototype JavaScript framework\n	"rhino"       : false,  //defines globals available when your code is running inside of the Rhino runtime environment\n	"worker"      : true,   //defines globals available when your code is running inside of a Web Worker\n	"wsh"         : false,  //defines globals available when your code is running as a script for the Windows Script Host\n	"yui"         : false,  //defines globals exposed by the YUI JavaScript framework\n\n	"predef" : [  // Custom globals.\n		"define",\n		"describe",\n		"before",\n		"beforeEach",\n		"after",\n		"afterEach",\n		"it",\n		"require"\n	],\n\n	// LEGACY\n	// These options are legacy from JSLint. Aside from bug fixes they will not\n	// be improved in any way and might be removed at any point.\n\n	"nomen"    : false,  //disallows the use of dangling `_` in variables\n	"onevar"   : false,  //allows only one `var` statement per function\n	"passfail" : false,  //makes JSHint stop on the first error or warning\n	"white"    : false   //make JSHint check your source code against Douglas Crockford\'s JavaScript coding style\n}\n',
				'/target/gulpfile.js': "var gulp = require( 'gulp' );\nvar bg = require( 'biggulp' )( gulp );\n\ngulp.task( 'coverage', bg.withCoverage() );\n\ngulp.task( 'coverage-watch', function() {\n	bg.watch( [ 'coverage' ] );\n} );\n\ngulp.task( 'show-coverage', bg.showCoverage() );\n\ngulp.task( 'continuous-specs', function() {\n	return bg.test();\n} );\n\ngulp.task( 'specs-watch', function() {\n	bg.watch( [ 'continuous-specs' ] );\n} );\n\ngulp.task( 'test-and-exit', function() {\n	return bg.testOnce();\n} );\n\ngulp.task( 'default', [ 'coverage', 'coverage-watch' ], function() {} );\ngulp.task( 'specs', [ 'continuous-specs', 'specs-watch' ], function() {} );\ngulp.task( 'test', [ 'test-and-exit' ] );\n",
				'/target/package.json': '{\n  "name": "test-project",\n  "version": "0.1.0",\n  "description": "this is a description",\n  "main": "src/index.js",\n  "scripts": {\n    "test": "gulp test"\n  },\n  "repository": {\n    "type": "git",\n    "url": "https://github.com/test-owner/test-project"\n  },\n  "keywords": [\n  ],\n  "author": "test-author",\n  "contributors": [\n    {\n    }\n  ],\n  "license": "MIT License - http://opensource.org/licenses/MIT",\n  "bugs": {\n    "url": "https://github.com/test-owner/test-project/issues"\n  },\n  "publishConfig": {\n    "registry": "https://registry.npmjs.org/test-project"\n  },\n  "homepage": "https://github.com/test-owner/test-project",\n  "devDependencies": {\n    "biggulp": "0.*.*",\n    "chai": "^2.1.1",\n    "chai-as-promised": "^4.3.0",\n    "gulp": "3.*.*",\n    "proxyquire": "~1.4.0",\n    "sinon": "~1.14.1"\n  },\n  "dependencies": {\n  }\n}\n',
				'/target/README.md': '# test readme 0.0.5\n',
				'/target/src/index.js': "process.title = 'test-project';\nvar autohost = require( 'autohost' );\nvar hyped = require( 'hyped' );\nvar host = hyped.createHost( autohost, {} );\nhost.start();\n"
			} );
		} );

		after( function() {
			clear();
		} );
	} );

	describe( 'with templated structure', function() {
		before( function() {
			return expand(
				path.resolve( './spec/data/one/template/v0.0.5/_items/resource' ),
				'/target',
				undefined,
				{
					resourceName: 'test-resource'
				},
				[
					path.resolve( './spec/data/one/template/v0.0.5/_items/resource/resource.js' )
				],
				{
					'./resource.js': './resources/${resourceName}/resource.js'
				}
			);
		} );

		it( 'should write all files from the template repository', function() {
			written.should.eql( {
				'/target/resources/test-resource/resource.js': "module.exports = function( host ) {\n	return {\n		name: 'test-resource',\n		actions: {\n			'self': {\n				url: '/:id',\n				method: 'get',\n				handle: function( envelope ) {\n					return { id: envelope.data.id };\n				}\n			}\n		}\n	};\n};\n"
			} );
		} );

		after( function() {
			clear();
		} );
	} );

	describe( 'with missing template field', function() {
		it( 'should write all files from the template repository', function() {
			return expand(
				path.resolve( './spec/data/one/template/v0.0.5' ),
				'/target',
				undefined,
				{
					projectName: 'test-project',
					description: 'this is a description',
					owner: 'test-owner'
				},
				files
			).should.eventually.be.rejectedWith( 'author is not defined' );
		} );
	} );
} );
