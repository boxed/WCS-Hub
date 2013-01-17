from unittest import TestCase, main as run_tests
from relative_placement import *

class Test(TestCase):
    def check_data(self, data):
        self.assertEquals([x[-1][-1] for x in calculate_scores(data)], range(1, len(data)+1))

    def test_CDS_2011_int_jj_finals(self):
        data = [
            # couple ID, judge placements..., final placement
            [('Matthew Taylor', 'Hayley Minkin'),       ( 2,  3,  1,  1,  3,  4,  9),  1],
            [('Cameron Martinez', 'Erica Piper'),       ( 1,  1,  9,  5,  1,  3,  5),  2],
            [('Larkin Beanland', 'Jessica Murray'),     ( 3,  2,  6,  2,  7,  7,  1),  3],
            [('David Guido', 'Leigh Gravette'),         ( 6,  4,  8,  4,  2,  6,  4),  4],
            [('Forrest Hanson', 'Sammi Sekhorn'),       ( 5, 10,  4,  3,  8,  1,  7),  5],
            [('David Hemmerich', 'Cassandra Winter'),   ( 4,  9,  5,  6,  4,  2,  8),  6],
            [('Anders Hovmoller', 'Shantala Davis'),    (10,  5,  7,  7,  9,  5,  3),  7],
            [('Jonathan Uy', 'Jessica Greer'),          ( 7,  6,  3, 10, 10, 10,  6),  8],
            [('Marcus Sterling', 'Stephanie Springer'), ( 8,  7, 10,  8,  6,  9,  2),  9],
            [('William Sawyer', 'Holly Skinner'),       ( 9,  8,  2,  9,  5,  8, 10), 10],
        ]
        self.check_data(data)

    def test_CDS_2012_all_stars_jj_finals(self):
        data = [
            [('Joshua Sturgeon', 'Chevy Slater'),	    (2,	1,	1,	2,	3),	1],
            [('Brad Whelan', 'Kara Frenzel'),	        (4,	3,	6,	1,	1),	2],
            [('Christopher Dumond', 'Janelle Guido'),	(3,	2,	2,	6,	5),	3],
            [('Cameron Crook', 'Jessica Pacheco'),	    (5,	4,	3,	3,	2),	4],
            [('Bob Tucker', 'Katrina Ostrenski'),	    (7,	6,	5,	5,	4),	5],
            [('Diego Borges', 'Mackenzie Goodmanson'),	(6,	5,	7,	4,	6),	6],
            [('Rome Slater', 'Tashina Beckmann'),	    (1,	7,	4,	7,	7),	7],
        ]
        self.check_data(data)

    def test_jose_de_la_mancha(self):
        data = [
            [('Couple A'),	    (4,	1,	1,	2,	1),	1],
            [('Couple B'),	    (2,	3,	5,	4,	4),	2],
            [('Couple C'),	    (1,	5,	4,	1,	5),	3],
            [('Couple D'),	    (5,	6,	3,	3,	8),	4],
            [('Couple E'),	    (7,	2,	2,	6,	7),	5],
            [('Couple F'),	    (6,	8,	8,	5,	2),	6],
            [('Couple G'),	    (8,	4,	6,	8,	6),	7],
            [('Couple H'),	    (3,	7,	7,	7,	3),	8],
        ]
        self.check_data(data)

    def test_example_from_WSDC_docs(self):
        data = [
            [('couple 1'), (1, 1, 3, 2, 3), 1],
            [('couple 2'), (6, 5, 4, 1, 2), 4],
            [('couple 3'), (2, 4, 1, 5, 5), 3],
            [('couple 4'), (4, 2, 5, 6, 6), 6],
            [('couple 5'), (5, 6, 2, 3, 4), 5],
            [('couple 6'), (3, 3, 6, 4, 1), 2],
        ]
        self.check_data(data)

if __name__ == '__main__':
    run_tests()