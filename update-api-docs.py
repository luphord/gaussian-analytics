#!/usr/bin/env python3

import os
import subprocess

apidoc = subprocess.run(['./node_modules/.bin/jsdoc2md', '-d', '4', 'gaussian-analytics.js'],
                        stdout=subprocess.PIPE).stdout.decode('utf8').splitlines()

with open('README.md') as f:
    readme = f.readlines()

with open('README.md', 'w') as f:
    in_apidoc = False
    for line in readme:
        if in_apidoc:
            if '## History' in line:
                in_apidoc = False
        if not in_apidoc:
            f.write(line)
        if '## API Documentation' in line:
            in_apidoc = True
            f.write(os.linesep)
            for apidoc_line in apidoc:
                f.write(apidoc_line + os.linesep)