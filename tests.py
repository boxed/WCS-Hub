from unittest import TestCase, main as run_tests
from relative_placement import *

class Test(TestCase):
    def check_data(self, data):
        # print_final_tabulation(calculate_scores(data))
        scores = calculate_scores(data)[:12] # We only care that the first 12 are correct, functionally the rest are split last place
        self.assertEquals([x[-1].user_data for x in scores], range(1, len(scores)+1))

    def test_CDS_2011_int_jj_finals(self):
        data = [
            # couple ID, judge placements..., final placement
            CoupleScoring('Matthew Taylor, Hayley Minkin',       ( 2,  3,  1,  1,  3,  4,  9), None,  1),
            CoupleScoring('Cameron Martinez, Erica Piper',       ( 1,  1,  9,  5,  1,  3,  5), None,  2),
            CoupleScoring('Larkin Beanland, Jessica Murray',     ( 3,  2,  6,  2,  7,  7,  1), None,  3),
            CoupleScoring('David Guido, Leigh Gravette',         ( 6,  4,  8,  4,  2,  6,  4), None,  4),
            CoupleScoring('Forrest Hanson, Sammi Sekhorn',       ( 5, 10,  4,  3,  8,  1,  7), None,  5),
            CoupleScoring('David Hemmerich, Cassandra Winter',   ( 4,  9,  5,  6,  4,  2,  8), None,  6),
            CoupleScoring('Anders Hovmoller, Shantala Davis',    (10,  5,  7,  7,  9,  5,  3), None,  7),
            CoupleScoring('Jonathan Uy, Jessica Greer',          ( 7,  6,  3, 10, 10, 10,  6), None,  8),
            CoupleScoring('Marcus Sterling, Stephanie Springer', ( 8,  7, 10,  8,  6,  9,  2), None,  9),
            CoupleScoring('William Sawyer, Holly Skinner',       ( 9,  8,  2,  9,  5,  8, 10), None, 10),
        ]
        self.check_data(data)

    def test_CDS_2012_all_stars_jj_finals(self):
        data = [
            CoupleScoring('Joshua Sturgeon, Chevy Slater',	    (2, 1, 1, 2, 3), None, 1),
            CoupleScoring('Brad Whelan, Kara Frenzel',	        (4, 3, 6, 1, 1), None, 2),
            CoupleScoring('Christopher Dumond, Janelle Guido',	(3, 2, 2, 6, 5), None, 3),
            CoupleScoring('Cameron Crook, Jessica Pacheco',	    (5, 4, 3, 3, 2), None, 4),
            CoupleScoring('Bob Tucker, Katrina Ostrenski',	    (7, 6, 5, 5, 4), None, 5),
            CoupleScoring('Diego Borges, Mackenzie Goodmanson', (6, 5, 7, 4, 6), None, 6),
            CoupleScoring('Rome Slater, Tashina Beckmann',	    (1, 7, 4, 7, 7), None, 7),
        ]
        self.check_data(data)

    def test_jose_de_la_mancha(self):
        data = [
            CoupleScoring('Couple A', (4, 1, 1, 2, 1), None, 1),
            CoupleScoring('Couple B', (2, 3, 5, 4, 4), None, 2),
            CoupleScoring('Couple C', (1, 5, 4, 1, 5), None, 3),
            CoupleScoring('Couple D', (5, 6, 3, 3, 8), None, 4),
            CoupleScoring('Couple E', (7, 2, 2, 6, 7), None, 5),
            CoupleScoring('Couple F', (6, 8, 8, 5, 2), None, 6),
            CoupleScoring('Couple G', (8, 4, 6, 8, 6), None, 7),
            CoupleScoring('Couple H', (3, 7, 7, 7, 3), None, 8),
        ]
        self.check_data(data)

    def test_example_from_WSDC_docs(self):
        data = [
            CoupleScoring('couple 1', (1, 1, 3, 2, 3), None, 1),
            CoupleScoring('couple 2', (6, 5, 4, 1, 2), None, 4),
            CoupleScoring('couple 3', (2, 4, 1, 5, 5), None, 3),
            CoupleScoring('couple 4', (4, 2, 5, 6, 6), None, 6),
            CoupleScoring('couple 5', (5, 6, 2, 3, 4), None, 5),
            CoupleScoring('couple 6', (3, 3, 6, 4, 1), None, 2),
        ]
        self.check_data(data)

    def test_chief_judge_tie_break(self):
        data = [
            CoupleScoring('couple 1', (1, 5, 4, 3, 2), 1, 1),
            CoupleScoring('couple 2', (2, 1, 5, 4, 3), 2, 2),
            CoupleScoring('couple 3', (3, 2, 1, 5, 4), 3, 3),
            CoupleScoring('couple 4', (4, 3, 2, 1, 5), 4, 4),
            CoupleScoring('couple 5', (5, 4, 3, 2, 1), 5, 5),
            CoupleScoring('couple 6', (6, 6, 6, 6, 6), 6, 6),
        ]
        self.check_data(data)

    def test_only_rank_top_12(self):
        data = [
            CoupleScoring('couple 1',  (   1,    1,    1,    1,    1), None,  1),
            CoupleScoring('couple 2',  (   2,    2,    2,    2,    2), None,  2),
            CoupleScoring('couple 3',  (   3,    3,    3,    3,    3), None,  3),
            CoupleScoring('couple 4',  (   4,    4,    4,    4,    4), None,  4),
            CoupleScoring('couple 5',  (   5, None,    5,    5,    5), None,  5),
            CoupleScoring('couple 6',  (   6,    6,    6,    6,    6), None,  6),
            CoupleScoring('couple 7',  (   7,    7,    7,    7,    7), None,  7),
            CoupleScoring('couple 8',  (   8,    8,    8,    8,    8), None,  8),
            CoupleScoring('couple 9',  (   9,    9,    9,    9,    9), None,  9),
            CoupleScoring('couple 10', (  10, None,   10,   10, None), None, 10),
            CoupleScoring('couple 11', (  11,    5, None,   11,   11), None, 11),
            CoupleScoring('couple 12', (  12, None, None,   12,   12), None, 12),
            CoupleScoring('couple 13', (  13, None,   13, None, None), None, 13),
            CoupleScoring('couple 14', (None,   10,   11, None, None), None, 14),
            CoupleScoring('couple 15', (None, None,   12, None,   10), None, 15),
        ]
        self.check_data(data)

if __name__ == '__main__':
    run_tests()