import uuid
import hashlib
from flask import render_template, request, abort, Response, redirect, url_for
from flask import session
from flask.json import jsonify
from urlparse import urlparse, urlunparse

from . app import app
from . util import pem
from . models import db, App

@app.route('/auth/<app_id>')
def view_auth(app_id):
    registered = App.query.filter_by(app_id=app_id).first()
    if registered is None:
        abort(404)

    nonce = str(uuid.uuid4().get_hex().upper()[0:6])
    state = request.args['state']
    return render_template('auth.html', nonce=nonce, app=registered, state=state)

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


@app.route('/register_app')
def register_app():
    return render_template('register_app.html')


@app.route('/register_app', methods=['POST'])
def register_app_post():
    name = request.form['name']
    url = request.form['auth_url']
    if request.form.get('csrf') != session.get('_csrf_token'):
        abort(400)

    au = urlparse(url)
    if au.scheme != 'https':
        return redirect(url_for('register_app'))

    unparsed = urlunparse((au.scheme, au.netloc, au.path, '', '', ''))
    registered = App.create_new(name=name, auth_url=unparsed)

    db.session.add(registered)
    db.session.commit()
    session['can_edit'] = registered.app_id
    return redirect(url_for('show_app', app_id=registered.app_id))


@app.route('/app/<app_id>')
def show_app(app_id=None):
    if not session.get('can_edit'):
        abort(403)

    registered = App.query.filter_by(app_id=app_id).first()
    if registered is None:
        abort(404)

    can_edit = session['can_edit'] == registered.app_id
    return render_template('show_app.html', app=registered, can_edit=can_edit)

def generate_csrf_token():
    if '_csrf_token' not in session:
        session['_csrf_token'] = str(uuid.uuid4())
    return session['_csrf_token']

app.jinja_env.globals['csrf_token'] = generate_csrf_token
