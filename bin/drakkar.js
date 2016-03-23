#!/usr/bin/env node

'use strict';

const argentum = require('argentum');
const _ = require('underscore');
const Drakkar = require('..');
const path = require('path');

var argv = process.argv.slice(2);
var args = argentum.parse(argv, {
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

drakkar.compileDir(argv[0] || process.cwd(), args.output)
.catch(error => {
    if (DEBUG) {
        console.error(error.stack);
    } else {
        console.error(error.message);
    }
});
