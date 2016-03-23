const fs = require('fs');
const path = require('path');

module.exports = (function(){
    var style = fs.readFileSync(path.join(__dirname, 'style', 'default.css'));

    return function drakkarTemplate(input) {
        return `
            <html>
            <head>
                <title>
                ${input.title}
                </title>
                <style>
                ${style}
                </style>
            </head>
            <body class="drk-page">
                <div class="drk-sidebar">
                ${input.sidebar}
                </div>
                <div class="drk-doc">
                ${input.content}
                </div>
                <!-- ${input.file} -->
                <script>
                    const DRAKKAR_FILE = ${JSON.stringify(input.file)};

                    var links = document.querySelectorAll('.drk-sidebar a');
                    var link;
                    var i = -1;
                    var l = links.length
                    while(++i < l) {
                        link = links[i];

                        if (link.getAttribute('href') === DRAKKAR_FILE) {
                            link.style.fontWeight = 'bold';
                        }
                    }

                </script>
                </body>
            </html>
        `;
    };
})();
