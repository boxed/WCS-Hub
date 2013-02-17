from math import ceil
# Implementation of Swing Dance Council relative placement. The algorithm is described at http://www.swingdancecouncil.com/library/relativeplacement.htm
# Comments starting with '###' are instructions directly from the document, hopefully they make it clear how the code relates to the document

### C. Tallying the Final Placements

class CoupleScoring(object):
    def __init__(self, name, judges_scores, chief_judge_score, user_data=None):
        self.name, self.judges_scores, self.chief_judge_score, self.user_data = name, judges_scores, chief_judge_score, user_data

### 1. In the finals, each Judge must place every couple in rank order (1st place, 2nd place, 3rd place, etc.).
class InvalidScoresError(Exception):
    def __init__(self, errors):
        self.errors = errors

def validate_scores(data):
    errors = []
    judges_data = {}
    for row in data:
        assert isinstance(row, CoupleScoring)
        row.judges_scores = [cell or len(data)+1 for cell in row.judges_scores]
        for i, item in enumerate(row.judges_scores):
            if item is not None:
                judge_data = judges_data.setdefault(i+1, [])
                judge_data.append(item)
        judges_data.setdefault('chief_judge', [])
        judges_data['chief_judge'].append(row.chief_judge_score)
    for key, judge_data in judges_data.items():
        ### ...  In finals, with a large field of couples, the Judges will concentrate on placing the top twelve couples.
        ### 3. Duplicate placements are not permitted. If a Judge mistakenly provides duplicate placements, the Scorer will alert the Chief Judge, who will request that the Judge in question provide unique placements for each couple.
        if sorted(judge_data)[:12] != range(1, len(judge_data[:12])+1) and judge_data != [None for _ in range(len(judge_data))]:
            errors.append('Judge %s has supplied incomplete or incorrect data' % key)
        # TODO: validate chief judges data
    if errors:
        raise InvalidScoresError(errors)

### 2. Raw scores (9.5, 8.9, 7.6, etc.) are used only to determine a Judge's order of placements. If a Judge submits only raw scores, the Scorer will convert them into ordinals, (1, 2, 3, etc.) for Relative Placement.
# TODO, probably in validate_scores, since there we know if we've gotten invalid scores

def number_of_votes_and_sum(row, from_placement):
    assert isinstance(row, CoupleScoring)
    ### 4. A couple must have a majority of Judges' votes to be awarded a final placement.
    majority_count = int(ceil(len(row.judges_scores)/2.0))

    votes = sum([1 for x in row.judges_scores if x <= from_placement])
    if votes < majority_count:
        #### 5. If no couple has a majority of votes, then the next placement  is added to the previous placements (1st through 2nd, 1st through 3rd, etc.) until a majority is reached.
        return 0, 0
        ### 6. If two or more couples have an equal majority, then the numerical value of the ordinals for each couple is added. The couple with the lowest sum gets the higher position.
    return votes, -sum([x for x in row.judges_scores if x <= from_placement])

def voting_tabulation(row, places):
    ### 6 continued:... If the sums for two or more couples are identical, then the next placement is added to the previous placements for those tied couples only.
    return [number_of_votes_and_sum(row, x)+(1.0/row.chief_judge_score if row.chief_judge_score is not None else None,) for x in xrange(1, places)]

# couple ID, judge placements..., final placement
def calculate_scores(data):
    if not data:
        return
    assert isinstance(data[0], CoupleScoring)

    places = len(data)

    validate_scores(data)

    final_result = sorted([(voting_tabulation(row, places), row) for row in data], reverse=True)
    return final_result

def format_final_tabulation(final_result):
    result = []
    for tabulation, couple_scoring in final_result:
        result.append(''.join(['{:>3} ({:>3})'.format(*x) for x in tabulation]).replace('-', ' ') + '  |  %(name)s' % couple_scoring.__dict__)
    return '\n'.join(result)

def print_final_tabulation(final_result):
    print format_final_tabulation(final_result)