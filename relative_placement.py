from math import ceil
# Implementation of Swing Dance Council relative placement. The algorithm is described at http://www.swingdancecouncil.com/library/relativeplacement.htm
# Comments starting with '###' are instructions directly from the document, hopefully they make it clear how the code relates to the document

### C. Tallying the Final Placements

### 1. In the finals, each Judge must place every couple in rank order (1st place, 2nd place, 3rd place, etc.).
def validate_scores(data):
    judges_data = {}
    for row in data:
        for i, item in enumerate(row[1]):
            if item:
                judge_data = judges_data.get(i, [])
                judge_data.append(item)
    for judge_data in judges_data:
        ### ...  In finals, with a large field of couples, the Judges will concentrate on placing the top twelve couples.
        ### 3. Duplicate placements are not permitted. If a Judge mistakenly provides duplicate placements, the Scorer will alert the Chief Judge, who will request that the Judge in question provide unique placements for each couple.
        assert sorted(judge_data)[:12] == range(1, len(judge_data[:12])+1)

### 2. Raw scores (9.5, 8.9, 7.6, etc.) are used only to determine a Judge's order of placements. If a Judge submits only raw scores, the Scorer will convert them into ordinals, (1, 2, 3, etc.) for Relative Placement.

# TODO, probably in validate_scores, since there we know if we've gotten invalid scores

def number_of_votes_and_sum(row, from_placement):
    ### 4. A couple must have a majority of Judges' votes to be awarded a final placement.
    majority_count = int(ceil(len(row[1])/2.0))

    votes = sum([1 for x in row[1] if x <= from_placement])
    if votes < majority_count:
        #### 5. If no couple has a majority of votes, then the next placement  is added to the previous placements (1st through 2nd, 1st through 3rd, etc.) until a majority is reached.
        return 0, 0
    ### 6. If two or more couples have an equal majority, then the numerical value of the ordinals for each couple is added. The couple with the lowest sum gets the higher position. 
    return votes, -sum([x for x in row[1] if x <= from_placement])
    
def voting_tabulation(row, places):
    ### 6 continued:... If the sums for two or more couples are identical, then the next placement is added to the previous placements for those tied couples only.
    return [number_of_votes_and_sum(row, x) for x in xrange(1, places)]

# couple ID, judge placements..., final placement
def calculate_scores(data):
    places = len(data)

    validate_scores(data)

    final_result = sorted([(voting_tabulation(row, places), row) for row in data], reverse=True)
    return final_result

def print_final_tabulation(final_result):
    for tabulation, (couple, judge_scores, final_placement) in final_result:
        print ''.join(['{:>3} ({:>3})'.format(*x) for x in tabulation]), couple, final_placement
