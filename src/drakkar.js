'use strict';

const glob = require('glob');
const path = require('path');
const pify = require('pify');
const globp = pify(glob);
const marked = require('marked');
const fs = require('fs');
const fsp = pify(fs);
const highlight = require('highlight.js');
const csv = require('csv-string');

marked.setOptions({
    highlight: function (code, lang) {
        var output = code;
        if (lang) {
            output = highlight.highlightAuto(output).value;
        }
        return '<div class="hljs">' + output + '</div>';
    }
});

module.exports = Drakkar;

var drakkarTemplate = require('./template.js');

function Drakkar(options) {
    var opts = Object.assign({}, options);

    this.verbose = !! opts.verbose;
    this.renderer = options.renderer || new marked.Renderer();
    this.template = options.template || this.template;

    Object.assign(this.renderer.plugins, {
        csv(params, block) {
            let head = params.split(/\s*,\s*/).map(escape);
            let table = csv.parse(block);

            return `<table><thead><tr><th>${head.join('</th><th>')}</th></tr></thead><tbody><tr>${table.map((row) => '<td>' + row.map(escape).join('</td><td>') + '</td>').join('</tr><tr>')}</tr></tbody></table>`;
        },
        iframe(params) {
            return `<iframe src="${escape(params)}"></iframe>`;
        },
    });
}

Drakkar.prototype.template = drakkarTemplate;

Drakkar.prototype.compileDir = function (sources, output){
    return this.collectFiles(sources)
    .then(files =>
        exists(output)
        .then(status => {
            if (! status) {
                return fsp.mkdir(output);
            }
        })
        .then(() => {
            var sidebar = false;
            var promise;

            for(let i in files) {
                let file = files[i];
                if (file === '_.md') {
                    sidebar = true;
                    files.splice(i, 1);
                    break;
                }
            }

            if (sidebar) {
                promise = fsp.readFile(path.join(sources, '_.md'), 'utf8')
                .then(content => {
                    return marked(content, {
                        gfm: true,
                        plugins: true,
                        renderer: this.renderer,
                    });
                });
            } else {
                promise = Promise.resolve();
            }

            return promise.then(sidebar =>
                Promise.all(files.map(file => {
                    if (file.slice(-3) !== '.md') {
                        return copy(
                            path.join(sources, file),
                            path.join(output, file)
                        );
                    } else {
                        var dest = path.join(output, file.slice(0, -3) + '.html');
                        return fsp.readFile(path.join(sources, file), 'utf8')
                        .then(content => marked(content, {
                            plugins: true,
                            gfm: true,
                            renderer: this.renderer
                        }))
                        .then(content => this.template({
                            source: file,
                            file: '/' + file.slice(0, -3) + '.html',
                            title: path.basename(file, '.md').replace(/(^|-|_)(\w)/, (v, s, d) => {
                                return d.toUpperCase();
                            }),
                            sidebar: sidebar,
                            content: content,
                        }))
                        .then(content => fsp.writeFile(dest, content))
                        .then(() => dest)
                        ;
                    }
                }))
            );
        })
    );
};

Drakkar.prototype.collectFiles = function (dir) {
    return globp('**', {cwd:dir});
};

function exists(filepath) {
    return (new Promise((resolve) => {
        fs.exists(filepath, resolve);
    }));
}

function copy(source, target) {
    return exists(source)
    .then(status => {
        if (! status) {
            throw new Error(`File "${source}" not exists"`);
        }

        return fsp.stat(source)
        .then(stat => {
            if (stat.isDirectory()) {
                return fsp.mkdir(target).then(() => target);
            } else {
                return copyFile(source, target).then(() => target);
            }
        });
    });
}

function copyFile(source, target) {
    return new Promise(function(resolve, reject) {
        var rd = fs.createReadStream(source);
        rd.on('error', reject);
        var wr = fs.createWriteStream(target);
        wr.on('error', reject);
        wr.on('finish', resolve);
        rd.pipe(wr);
    });
}

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
