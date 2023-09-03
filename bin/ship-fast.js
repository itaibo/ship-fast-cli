#! /usr/bin/env node
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const DEFAULT_DIRECTORY = 'ship-fast';
const GIT_DESTINATION = 'git@github.com:Marc-Lou-Org/ship-fast.git';

async function main() {
	const args = process.argv.slice(2);

	const directory = args[0] ?? DEFAULT_DIRECTORY;

	// Util functions
	function error(message, details) {
		console.error(`Error: ${message}`);

		if (details) {
			console.error(details);
		}

		return process.exit(1);
	}

	// Check directory is empty
	try {
		const { stdout } = await exec(`ls ${directory}`);
		if (stdout) {
			return error('Directory must be empty!');
		}
	} catch (e) {
		if (e?.stderr && !e.stderr.includes('No such file or directory')) {
			return error('Could not list directory', e);
		}
	}

	// Download template
	try {
		console.log(`Downloading ship-fast from ${GIT_DESTINATION}...`);
		await exec(`git clone ${GIT_DESTINATION} ${directory} --depth 1`);
	} catch (e) {
		return error('Could not clone repository', e);
	}

	// Remove .git
	try {
		await exec(`cd ${directory}; rm -rf .git`);
	} catch (e) {
		return error('Could not remove .git', e);
	}

	// Initialize .git
	try {
		console.log('Initializing new git...');
		await exec(`cd ${directory}; git init`);
	} catch (e) {
		return error('Could not initialize git', e);
	}

	// Run npm install
	try {
		console.log(`Executing npm install...`);
		await exec(`cd ${directory}; npm install`);
	} catch (e) {
		return error('Could not execute npm install', e);
	}

	// Finish
	console.log('Ready to ship! Try "npm run dev" to start the server')
};

module.exports = main();
