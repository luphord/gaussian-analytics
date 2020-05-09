#!/bin/sh
./node_modules/.bin/jsdoc2md -d 4 gaussian-analytics.js > apidoc.md
sed -i -n '/## API Documentation/{p;:a;N;/## History/!ba;s/.*\n/\n------apidocmarker-------\n\n/};p' README.md
sed -i -e '/------apidocmarker-------/{r apidoc.md' -e 'd}' README.md
rm apidoc.md