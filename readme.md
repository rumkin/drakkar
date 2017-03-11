# Drakkar

Drakkar is pretty simple markdown site generator with only one feature. This
feature is support of menu document named `_.md` which is visible on each
page as a sidebar.

## Installation

Install with npm
```
npm install drakkar -g
```

## Structure

Default site structure should contain `_.md` document in the root directory.
This file would be used as sidebar.

FS layout example:

```
.
|-- drakkar.js
|-- index.md
|-- license.md
|-- _.md
`-- sub
    `-- doc.md
```

## Usage

Drakkar has two arguments. The first is sources directory (default is `.`) and the second is output directory (default is `www-docs`).

```
drakkar [options] [source]

-v,--verbose Verbose output
-d,--debug   Debug
-o,--output  Output directory. Default is `www-docs`.
```

If there is `drakkar.js` in sources dir then it will be used to modify drakkar
instance.

Modifier script example:

```javascript
module.exports = function() {
    this.renderer.plugins.date = function(date) {
        return new Date();
    };
}
```

## License

MIT.
