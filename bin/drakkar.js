#!/usr/bin/env node

'use strict';

const Drakkar = require('..');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const commander = require('commander');

commander
    .description('Static site generator')
    .usage('[options] <source>')
    .option('-d, --debug', 'Debug mode')
    .option('-v, --verbose', 'Verbose output')
    .option('-o, --output [output]', 'Output directory. Default is `www-docs`')
    .parse(process.argv);

const DEBUG = commander.hasOwnProperty('debug')
 ? commander.debug
 : process.env.DEBUG === '1';

const drakkar = new Drakkar({
    verbose: commander.verbose
});

const sources = commander.args[0] || process.cwd();
const output = path.resolve(commander.output || 'www-docs');

if (! fs.existsSync(output)) {
    fs.mkdirSync(output);
}

let modScript = path.resolve(sources, 'drakkar.js');

if (fs.existsSync(modScript)) {
    let modifier = require(modScript);

    if (typeof modifier !== 'function') {
        throw new Error('Modifier is not a function');
    }

    drakkar.use(modifier);
}

drakkar.compileDir(sources, output)
.then(() => {
    if (commander.verbose) {
        console.log('Documentation generated in "%s".', chalk.bold(output));
    }
})
.catch(error => {
    if (DEBUG) {
        console.error(error.stack);
    } else {
        console.error(error.message);
    }
});
