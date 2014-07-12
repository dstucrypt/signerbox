import os
from flask import Flask
from werkzeug.contrib.cache import MemcachedCache

app = Flask('eusign')

try:
        cfg_path = os.path.join(os.environ['HOME'], 'app.cfg')
except (KeyError, IOError, OSError):
        cfg_path = os.path.join(os.getcwd(), '..', 'app.cfg')

app.config.from_pyfile(cfg_path, silent=True)

app.cache = MemcachedCache(['127.0.0.1:11211'])
