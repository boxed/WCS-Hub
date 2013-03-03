from google.appengine.ext import db
from google.appengine.api import users
from json import JSONDecoder


class DictModel(db.Model):
    def to_dict(self):
        result = dict([(p, unicode(getattr(self, p))) for p in self.properties()]+[('id', unicode(self.key().id()))])
        if hasattr(self, 'JSON_fields'):
            decoder = JSONDecoder()
            for field in self.JSON_fields:
                result[field] = decoder.decode(result[field])
        return result

class Event(DictModel):
    JSON_fields = ['competitions']

    user = db.UserProperty(auto_current_user_add=True)
    name = db.StringProperty(required=True)
    description = db.TextProperty()
    date = db.DateProperty()
    registration_opens = db.DateProperty()
    registration_closes = db.DateProperty()
    competitions = db.TextProperty()


class Registration(DictModel):
    # NOTE: the parent object must be an Event instance
    JSON_fields = ['competitions']

    user = db.UserProperty(auto_current_user_add=True)
    first_name = db.StringProperty(required=True)
    last_name = db.StringProperty(required=True)
    lead_follow = db.StringProperty(required=True)
    competitions = db.TextProperty()