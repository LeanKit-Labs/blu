var ROOT_PATH = '~/.blu';
var _ = require( 'lodash' );
var semver = require( 'semver' );
var util = require( 'util' );
var when = require( 'when' );
var fs = require( './fs' );
var path = require( 'path' );
var templateFsm = require( './template.fsm' );
var releases = require( './gh' );
var templates = require( './template' );
var create = templates.init( ROOT_PATH );

function createVersion( owner, repo, version, item ) {
	var onVersion = item ? createItem.bind( undefined, item ) : createTemplate;
	return getTemplate( owner, repo, version )
		.then( function( template ) {
			template.repo = [ owner, repo ].join( '/' );
			return template;
		} )
		.then( onVersion );
}

function createItem( item, template ) {
	var itemTemplate = template.items[ item ];
	if ( !itemTemplate ) {
		console.error( util.format(
			'Item template "%s" does not exist in template "%s"',
			item,
			template.repo
		) );
		return;
	}

	var fsm = templateFsm( process.cwd(), itemTemplate );
	function onFinished() {
		console.log( 'Item template created successfully!' );
	}
	function onError( err ) {
		if ( err.step ) {
			console.error( util.format(
				'Item template failed on step "%s" with error: %s',
				err.step,
				err.error.message
			) );
		} else {
			console.error( 'Item template failed with the error:', err.message );
		}
	}
	fsm.start()
		.then( onFinished, onError );
}

function createTemplate( template ) {
	var fsm = templateFsm( process.cwd(), template );
	function onFinished() {
		console.log( 'Template created successfully!' );
	}
	function onError( err ) {
		if ( err.step ) {
			console.error( util.format(
				'Template failed on step "%s" with error: %s',
				err.step,
				err.error.message
			) );
		} else {
			console.error( 'Template failed with the error:', err.message );
		}
	}
	fsm.start()
		.then( onFinished, onError );
}

function getTemplate( owner, repo, version ) {
	function onTemplate( template ) {
		return template.loadVersion( version || template.latest )
			.then( undefined, function( err ) {
				console.log( err.message );
				process.exit( -1 );
			} );
	}
	function onTemplateMissing( err ) {
		console.error( err.message );
		process.exit( 1 );
	}
	return create( owner, repo )
		.then( onTemplate, onTemplateMissing );
}

function getVersions( owner, repo ) {
	function onError( err ) {
		console.error( util.format(
			'Requesting a version list for "%s/%s" from GitHub failed with %s',
			owner, repo, err ) );
		return when.reject( new Error( 'Invalid repository' ) );
	}
	function onVersions( versions ) {
		if ( versions.length === 0 ) {
			console.error( util.format(
				'blu requires tags in order to install a repository. Nag %s to add a tag to %s ;)',
				owner, repo ) );
			return when.reject( new Error( 'Repository has no tags' ) );
		} else {
			return versions;
		}
	}
	return releases.getList( owner, repo )
		.then( onVersions, onError );
}

function getVersionList( owner, repo ) {
	function onList( list ) {
		var sorted = _.pluck( list, 'version' ).sort( semver.rcompare );
		console.log( '  ' + sorted.join( '\n  ' ) );
	}
	getVersions( owner, repo )
		.then( onList, _.noop );
}

function install( owner, repo, version ) {
	getVersions( owner, repo )
		.then( installVersion.bind( undefined, owner, repo, version ), _.noop );
}

function installVersion( owner, repo, version, versions ) {
	var url;
	if ( version ) {
		url = _.where( versions, { version: version } )[ 0 ].url;
	} else {
		var latest = versions[ 0 ];
		version = latest.version;
		url = latest.url;
	}
	releases.download( ROOT_PATH, owner, repo, version, url )
		.then( onDownload );
}

function onDownload( result ) {
	return releases.extract( result )
		.then( releases.installModules );
}

function items( owner, repo, version ) {
	function onItems( template ) {
		version = version || path.basename( template.path );
		var items = _.keys( template.items );
		if ( items.length > 0 ) {
			console.log( util.format(
				'Template "%s/%s" (%s) has the following item templates:\n  %s',
				owner, repo, version, items.sort().join( '\n  ' )
			) );
		} else {
			console.log( util.format(
				'Template "%s/%s" (%s) does not contain item templates',
				owner, repo, version
			) );
		}
	}
	getTemplate( owner, repo, version )
		.then( onItems );
}

function list() {
	fs.listInstalls( ROOT_PATH )
		.then( function( listing ) {
			_.map( listing, function( projects, owner ) {
				_.map( projects, function( versions, project ) {
					console.log( [ owner, project ].join( '/' ) );
					_.map( versions.sort( semver.rcompare ), function( version ) {
						console.log( ' ', version );
					} );
				} );
			} );
		} );
}

function remove( owner, repo, version ) {
	function onRemoved() {
		if ( version ) {
			console.log( util.format(
				'Removed %s/%s version %s from installed templates successfully',
				owner, repo, version
			) );
		} else {
			console.log( util.format(
				'Removed all installed versions of template %s/%s successfully',
				owner, repo
			) );
		}
	}
	function onError( err ) {
		console.error( err.message );
	}

	fs.removeTemplate( ROOT_PATH, owner, repo, version )
		.then( onRemoved, onError );
}

module.exports = {
	create: createVersion,
	getVersions: getVersionList,
	install: install,
	items: items,
	list: list,
	remove: remove
};
