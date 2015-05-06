## blu
`blu` is an templating system that uses tagged GitHub repositories in order to generate projects. Project and item templates can include metadata and control files in order to provide features beyond simple file copying.

## Concepts

### Installation and Tags
`blu` works off of GitHub repositories that are tagged. A specific version for a template must be installed on the machine (`blu` uses `~/.blu`) in order to create projects or items.

### Templating
All files can use inline [`lodash`](https://github.com/lodash/lodash) templates. The data required by these templates must be provided via a set of prompts. Code imports can be provided to the templates by including a `.context.js` file that returns a hash containing the aliased libraries/functions required by the templates.

`blu` supports both project templates (intended one-time use) and item templates (repeatable additions). Item templates get their own subdirectories under a `_items` directory in the template.

### Prompts
`blu` uses a `.prompt.js` file to specify how to collect each template variable. [`Inquirer`](https://github.com/SBoudrias/Inquirer.js) is used to collect answers so the metadata provided by this file can take full advantage of its features.

```javascript
// a very simple template with only one variable would only need a single prompt
module.exports = [
	{
		name: 'projectName',
		type: 'input',
		message: 'Project name'
	}
];
```

### Context
The optional '.context.js' file should return a hash with anything required by the templates that are not provided by the prompts.

```javascript
// make environment variables available to the templates easily
module.exports = {
	'environment': process.env
}
```

### Structure
`blu` allows more control over where template files are placed through an optional `.structure.json` file. It provides a map of template files to a relative destination path that can contain template variables. The most common use case for this feature is for item templates.

> Note: the key and value paths should be relative to the repository root.

```json
{
	"./sourceFile.js": "./src/things/${thingName}.js"
}
```

Given a value of "test1" for `thingName`, a copy of `sourceFile.js` would be saved to `./src/things/test1.js` after running it through `lodash`'s template function.

### Commands
Before and after sets of shell commands can be specified using the optional '.commands.json'. To understanding all the features available in specifying these commands, see [`Drudgeon`'s](https://github.com/leankit-labs/drudgeon) documentation.

> Note: before and after commands refer to when the run relative to fulfilling the templates.

This example demonstrates before and after sets of tasks. The before will delete the local `node_modules` folder (if it exists) and then install any pre-defined package dependencies in one step and then install another set of libraries as dependencies.
```json
{
	"before": {
		"npm-clear": {
			"cwd": "./",
			"cmd": {
				"win32": "rmdir",
				"*": "rm"
			},
			"args": {
				"win32": [ "./node_modules", "/s" ],
				"*": [ "-rf", "./node_modules" ]
			}
		}
	},
	"after": {
		"npm-libs": {
			"cwd": "./",
			"cmd": {
				"win32": "npm.cmd",
				"*": "npm"
			},
			"args": [ "install" ]
		},
		"npm-dependencies": {
			"cwd": "./",
			"cmd": {
				"win32": "npm.cmd",
				"*": "npm"
			},
			"args": [ "install", "autohost", "hyped", "when", "lodash", "fount", "-S" ]
		}
	}
}
```

### Support Files
Because the `.prompts.js` and `.context.js` files can make use of custom code, you can store detailed support functionality under a `_support` folder to require into either of these files that will not be copied during project creation.

## CLI

## Managing Templates

### Installing Templates
Installs a template from a GitHub repository.

#### Latest Version
If no version is specified, `blu` will take the latest tag based on semver.

```bash
blu install owner/repository
```

#### Specific Version
If a version is specified, `blu` will install that specififed tag version locally for future use.

```bash
blu install owner/repository v0.1.0
```

### Viewing Remote Tags
Returns a list of all tags on the repository in GitHub.

```bash
blu tags owner/repository
```

### List Installed Templates and Versions
To view all installed templates and versions, use the list command.

```bash
blu list
```

### List Items For A Template
To see what item templates are part of a particular project, use the items command to get the list.

#### Latest Version
Items will be displayed for the latest version of the installed template if no version is specified.

```bash
blu items owner/repository
```

#### Specific Version
Items will be displayed for the specified template version (if installed).

```bash
blu items owner/repository v0.0.8
```

### Removing Templates
`blu` allows both removing all installed template versions as well as targeted installed versions.

#### All Versions
If no version is provided, _all_ installed versions are removed for the repository.

```bash
blu remove owner/repository
```

#### Specific Version
Only removes the version (if it has been previously installed).

```bash
blu remove owner/repository v0.0.1
```

## Creating Projects and Items
`blu` creates project and item templates in the **current working directory**. Please use caution when using the `create` and `item` commands.

### Projects
Creating a project from an installed template will:

 * run the before steps (if they exist)
 * collect data from user via prompts
 * expand templates (ignores anything under `_support` and `items`)
 * run the after steps (if they exist)

#### Using Latest Installed Version
Without specifying a version, `blu` will use the latest installed version based on semantic version comparison of the installed tags.

```bash
blu create owner/repository
```

#### Using A Specific Installed Version

```bash
blu create owner/repository v0.1.0
```

### Items

> Note: only metadata/control files found under the item's template folder get used during item creation.

Adding an item from a project does the following:

 * run the before steps (if they exist)
 * collect data from user via prompts
 * expand templates in the item's folder (ignores anything under `_support` and `items`)
 * run the after steps (if they exist)

#### Using Latest Installed Version
Without specifying a version, `blu` will use the latest installed version based on semantic version comparison of the installed tags.

```bash
blu item owner/repository itemName
```

#### Using A Specific Installed Version

> Note: the order is important - the version __must__ come first if specified.

```bash
blu item owner/repository v0.1.0 itemName
```
