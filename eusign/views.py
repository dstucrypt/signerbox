import uuid
from flask import render_template

from . app import app

@app.route('/auth')
def view_auth():
    nonce = str(uuid.uuid4().get_hex().upper()[0:6])
    return render_template('auth.html', nonce=nonce)
