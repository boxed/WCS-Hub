#!/usr/bin/env python
import webapp2
from json import JSONDecoder, JSONEncoder
from relative_placement import *


class MainHandler(webapp2.RequestHandler):
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

app = webapp2.WSGIApplication([
    ('/finals/', MainHandler)
], debug=True)
