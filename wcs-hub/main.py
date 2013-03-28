#!/usr/bin/env python
import httplib
import webapp2
from json import JSONDecoder, JSONEncoder
from relative_placement import *
from models import *
import datetime
import time
from google.appengine.ext import db
from google.appengine.api import users
import unicodedata
from iso8601 import iso8601
import logging

def get_date(s):
    r = iso8601.parse(s)
    if isinstance(r, datetime.datetime):
        r = r.date()
    assert isinstance(r, datetime.date)
    return r

def remove_diacretics(input_str):
    nkfd_form = unicodedata.normalize('NFKD', unicode(input_str))
    return u"".join([c for c in nkfd_form if not unicodedata.combining(c)])

class WCSJSONEncoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime.datetime):
            return o.isoformat()
        if isinstance(o, datetime.date):
            return o.isoformat()
        if isinstance(o, users.User):
            return unicode(o)
        return JSONEncoder.encode(self, o)

def toJSON(obj):
    return WCSJSONEncoder().encode(obj).replace('"None"', '""')

class CalculateRPView(webapp2.RequestHandler):
    def get(self):
        json = JSONDecoder().decode(self.request.GET.keys()[0])
        judges = json['judges']
        couples = []
        for couple in json['couples']:
            if couple['nr']:
                scores = [couple['scores'][str(judge)] if str(judge) in couple['scores'] else None for judge in judges]
                scores = [int(x) if x else None for x in scores]
                chief_judge_score = int(couple['chief_judge_score']) if couple['chief_judge_score'] else None
                couples.append(CoupleScoring({'nr': couple['nr'], 'leader': couple['leader'], 'follower': couple['follower']}, scores, chief_judge_score))
        try:
            scores = calculate_scores(couples)
            self.response.write(toJSON({
                'tabulation': format_final_tabulation(scores) if scores else '',
                'scores': [score[-1].__dict__ for score in scores] if scores else [],
            }))
        except InvalidScoresError, e:
            self.response.write(toJSON({'errors': e.errors}))
            self.response.status_int = 412

class EditEventView(webapp2.RequestHandler):
    def post(self):
        json = JSONDecoder().decode(JSONDecoder().decode(self.request.body)['event'])
        event = Event.get_by_id(int(json['id']))
        assert users.get_current_user().email() == event.user.email()

        event.name = json['name']
        event.description = json['description']
        event.date = get_date(json['date'])
        event.registration_opens = get_date(json['registration_opens'])
        event.registration_closes = get_date(json['registration_closes'])
        event.competitions_json = toJSON(json['competitions'])
        event.put()
        
        self.response.write('ok')

class CreateEventView(webapp2.RequestHandler):
    def post(self):
        json = JSONDecoder().decode(JSONDecoder().decode(self.request.body)['event'])

        logging.warn(json)

        Event(
            name=json['name'],
            description=json['description'],
            date=get_date(json['date']),
            registration_opens=get_date(json['registration_opens']),
            registration_closes=get_date(json['registration_closes']),
            competitions_json=toJSON(json['competitions'])
            ).put()
        self.response.write('ok')

class SearchWSDC(webapp2.RequestHandler):
    def get(self):
        conn = httplib.HTTPConnection('swingdancecouncil.heroku.com', timeout=4)
        conn.request('GET', '/pages/dancer_search_by_fragment.json?term='+remove_diacretics(self.request.GET.keys()[0]))
        res = conn.getresponse()
        if res.status == 200:
            data = res.read()
            self.response.write(data)

class ListEventsView(webapp2.RequestHandler):
    def get(self):
        today = datetime.datetime.now().date()
        if '__get__all__' in self.request.GET:
            available_events = [x.to_dict() for x in Event.all()]
        else:
            available_events = [x.to_dict() for x in Event.all().filter('registration_opens <', today) if x.registration_closes > today]
        result = {
            'events': available_events,
            'user': users.get_current_user().email(),
        }
        self.response.write(toJSON(result))

class EventView(webapp2.RequestHandler):
    def get(self):
        event_id = int(self.request.GET.keys()[0])
        self.response.write(toJSON(Event.get_by_id(event_id).to_dict()))

class RegistrationsView(webapp2.RequestHandler):
    def get(self):
        event = Event.get_by_id(int(self.request.GET.keys()[0]))
        assert users.get_current_user().email() == event.user.email()
        registrations = [x.to_dict() for x in db.query_descendants(event).run()]
        comps = {}
        for r in registrations:
            r['competitions'] = [x for x in r['competitions'] if x[1]]
            for comp in r['competitions']:
                for div in comp[1]:
                    bar = comps.setdefault(comp[0]+' '+div, [])
                    bar.append({
                        'user': r['user'],
                        'first_name': r['first_name'],
                        'last_name': r['last_name'],
                        'lead_follow': r['lead_follow'],
                    })
        result = {
            'event': event.to_dict(),
            'user': users.get_current_user().email(),
            'comps': comps,
            }
        self.response.write(toJSON(result))

class RegisterView(webapp2.RequestHandler):
    def post(self):
        json = JSONDecoder().decode(self.request.body)
        json['event'] = JSONDecoder().decode(json['event'])
        event = Event.get_by_id(int(json['event']['id']))
        Registration(
            parent=event,
            first_name=json['first_name'],
            last_name=json['last_name'],
            lead_follow=json['lead_follow'],
            competitions_json=toJSON([(comp, [div['name'] for div in divisions if div['value']]) for comp, divisions in json['event']['competitions'].items()]),
        ).put()
        self.response.write('ok')

class ResetDBView(webapp2.RequestHandler):
    def bulk_del(self, model_name):
        self.response.headers['Content-Type'] = 'text/plain'
        while True:
            q = db.GqlQuery('SELECT __key__ FROM %s' % model_name)
            if not q.count():
                break
            db.delete(q.fetch(200))
            time.sleep(0.5)

    def post(self):
        import os
        if os.environ['SERVER_SOFTWARE'].startswith('Development'):
            self.bulk_del('Event')
            self.bulk_del('Registration')
            self.response.write('ok')
        else:
            self.response.write('not a debug server')

app = webapp2.WSGIApplication([
    ('/ajax/calculate_rp/', CalculateRPView),
    ('/ajax/create_event/', CreateEventView),
    ('/ajax/edit_event/', EditEventView),
    ('/ajax/list_events/', ListEventsView),
    ('/ajax/event/', EventView),
    ('/ajax/register/', RegisterView),
    ('/ajax/registrations/', RegistrationsView),
    ('/ajax/search_wsdc/', SearchWSDC),

    ('/ajax/reset_db/', ResetDBView),
], debug=True)

