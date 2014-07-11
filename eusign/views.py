import uuid
import hashlib
from flask import render_template, request, abort, Response
from base64 import urlsafe_b64decode as b64decode
from flask.json import jsonify

from . app import app
from . util import pem

@app.route('/auth')
def view_auth():
    nonce = str(uuid.uuid4().get_hex().upper()[0:6])
    return render_template('auth.html', nonce=nonce)

@app.route('/api/1/certificates/', methods=['POST'])
def pub_cert():
    cert = request.stream.read()

    digest = hashlib.sha256()
    digest.update(cert)
    cert_id = digest.hexdigest()

    app.cache.set('cert-{}/'.format(cert_id), cert)
    return jsonify(cert_id=cert_id)

@app.route('/api/1/certificates/<cert_id>')
def get_cert(cert_id):
    ret = app.cache.get('cert-{}/'.format(cert_id))
    if ret is None:
        abort(404)

    return Response(pem(ret, "CERTIFICATE"), mimetype='text/pem')
