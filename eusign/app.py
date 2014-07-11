from flask import Flask
from werkzeug.contrib.cache import MemcachedCache


app = Flask('eusign')
app.cache = MemcachedCache(['127.0.0.1:11211'])
