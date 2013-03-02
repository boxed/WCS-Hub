#!/usr/bin/env python
import webapp2
from json import JSONDecoder, JSONEncoder
from relative_placement import *
from models import *
import datetime
from google.appengine.ext import db

def parse_iso_date(date):
    return datetime.datetime.strptime(date.split(".")[0]+"UTC", "%Y-%m-%dT%H:%M:%S%Z").date()

class CalculateRPView(webapp2.RequestHandler):
    def get(self):
        json = JSONDecoder().decode(self.request.GET.keys()[0])
        judges = json['judges']
        couples = []
        encoder = JSONEncoder()
        for couple in json['couples']:
            if couple['nr']:
                scores = [couple['scores'][str(judge)] if str(judge) in couple['scores'] else None for judge in judges]
                scores = [int(x) if x else None for x in scores]
                chief_judge_score = int(couple['chief_judge_score']) if couple['chief_judge_score'] else None
                couples.append(CoupleScoring({'nr': couple['nr'], 'leader': couple['leader'], 'follower': couple['follower']}, scores, chief_judge_score))
        try:
            scores = calculate_scores(couples)
            self.response.write(encoder.encode({
                'tabulation': format_final_tabulation(scores),
                'scores': [score[-1].__dict__ for score in scores],
            }))
        except InvalidScoresError, e:
            self.response.write(encoder.encode({'errors': e.errors}))
            self.response.status_int = 412

class CreateEventView(webapp2.RequestHandler):
    def post(self):
        json = JSONDecoder().decode(JSONDecoder().decode(self.request.body)['event'])

        Event(
            name=json['name'],
            description=json['description'],
            date=parse_iso_date(json['date']),
            registration_opens=parse_iso_date(json['registration_opens']),
            registration_closes=parse_iso_date(json['registration_closes']),
            competitions=JSONEncoder().encode(json['competitions']),
        ).put()
        self.response.write('ok')

class ListEventsView(webapp2.RequestHandler):
    def get(self):
        self.response.write(JSONEncoder().encode([x.to_dict() for x in Event.all()]))

class EventView(webapp2.RequestHandler):
    def get(self):
        event_id = int(self.request.GET.keys()[0][2:-2])
        self.response.write(JSONEncoder().encode(Event.get_by_id(event_id).to_dict()))

class RegisterView(webapp2.RequestHandler):
    def post(self):
        json = JSONDecoder().decode(self.request.body)
        json['event'] = JSONDecoder().decode(json['event'])
        # raise Exception(repr(json))
        event = Event.get_by_id(int(json['event']['id']))
        Registration(
            parent=event,
            first_name=json['first_name'],
            last_name=json['last_name'],
            lead_follow=json['lead_follow'],
            competitions=JSONEncoder().encode([(comp, [div['name'] for div in divisions if div['value']]) for comp, divisions in json['event']['competitions'].items()]),
        ).put()
        self.response.write('ok')

app = webapp2.WSGIApplication([
    ('/ajax/calculate_rp/', CalculateRPView),
    ('/ajax/create_event/', CreateEventView),
    ('/ajax/list_events/', ListEventsView),
    ('/ajax/event/', EventView),
    ('/ajax/register/', RegisterView),
], debug=True)
