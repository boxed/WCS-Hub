from google.appengine.ext import db
from google.appengine.api import users
from json import JSONDecoder


class DictModel(db.Model):
    def to_dict(self):
        decoder = JSONDecoder()
        result = dict(
            [
                (p[:-len('_json')], decoder.decode(getattr(self, p))) if p.endswith('_json') else (p, getattr(self, p))
                for p in self.properties()
            ]
            +[('id', unicode(self.key().id()))])
        return result

class Event(DictModel):
    user = db.UserProperty(auto_current_user_add=True)
    name = db.StringProperty(required=True)
    description = db.TextProperty()
    date = db.DateProperty()
    registration_opens = db.DateProperty()
    registration_closes = db.DateProperty()
    competitions_json = db.TextProperty()


class Registration(DictModel):
    # NOTE: the parent object must be an Event instance
    user = db.UserProperty(auto_current_user_add=True)
    first_name = db.StringProperty(required=True)
    last_name = db.StringProperty(required=True)
    lead_follow = db.StringProperty(required=True)
    competitions_json = db.TextProperty(required=True)
    wsdc_number = db.StringProperty()