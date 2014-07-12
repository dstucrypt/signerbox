import random
import string
from uuid import uuid4
from .db import db

class App(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text())
    password = db.Column(db.String(8))
    app_id = db.Column(db.String(32))
    auth_url = db.Column(db.String())

    @classmethod
    def create_new(cls, **kwargs):
        new_id = uuid4().bytes.encode('hex')
        random_pw = ''.join(
            random.choice(string.ascii_uppercase + string.digits)
            for _ in range(8)
        )
        
        return App(app_id=new_id, password=random_pw, **kwargs)
