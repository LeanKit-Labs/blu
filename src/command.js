var commander = require( 'commander' );
var package = require( '../package.json' );

function parse( args ) {
	commander
		.version( package.version )
		.command( 'create <repo> [version]', 'Creates a new project from a template.' )
		.command( 'install <repo> [version]', 'Install a template from a GitHub repository.' )
		.command( 'item <repo> [item] [version]', 'Creates a new project from a template.' )
		.command( 'items <repo>', 'Lists the item templates available in a specific template.' )
		.command( 'list', 'Lists installed templates on your system.' )
		.command( 'remove <repo> [version]', 'Removes a template version or all versions from your system.' )
		.command( 'tags <repo>', 'Request tags for the repo from GitHub.' )
		.parse( args );
}

module.exports = parse;
