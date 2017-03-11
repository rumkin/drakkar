#!/usr/bin/env node

'use strict';

const argentum = require('argentum');
const _ = require('underscore');
const Drakkar = require('..');
const fs = require('fs');
const path = require('path');

let argv = process.argv.slice(2);
let args = argentum.parse(argv, {
    defaults: {
        debug: process.env.DEBUG === '1',
        output: path.join(process.cwd(), 'drakkar'),
    },
    aliases: {
        d: 'debug',
    }
});

const DEBUG = args.debug;

const drakkar = new Drakkar({
    verbose: args.verbose
});

const sources = argv[0] || process.cwd();
const output = path.resolve(argv[1] || 'www-docs');

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
.catch(error => {
    if (DEBUG) {
        console.error(error.stack);
    } else {
        console.error(error.message);
    }
});
