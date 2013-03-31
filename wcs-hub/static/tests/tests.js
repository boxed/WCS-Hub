// = SECTION Setup

function new_scope() {
    return window.$injector.get('$rootScope').$new();
}

function create_controller(controller, params) {
    var scope = new_scope();
    var $controller = window.$injector.get('$controller');
    if (!params) {
        params = {};
    }
    params.$scope = scope;
    $controller(controller, params);
    return scope;
}

var today = new Date();
var tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
var yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

var get_url_done = false;
var get_url_result = '';
function get_url(url, method, data) {
    get_url_done = false;
    get_url_result = '';

    if (!method) {
        method = 'GET';
    }
    window.$injector.get('$http')({
        method: method,
        url: url,
        data: data}).
        success(
        function(data, status, headers, config) {
            get_url_done = true;
            get_url_result = data;
        }).
        error(
        function(data, status, headers, config) {
            get_url_done = true;
            get_url_result = status + data;
        });
    wait(function(){return get_url_done;}, 10000);
}

var scope;


// = SECTION Reset DB
get_url('/ajax/reset_db/', 'POST');

// = SECTION
print(get_url_result);
// => ok


// = SECTION MenuCtrl
scope = create_controller(MenuCtrl);
print(scope.getClass('/foo'));
// =>
print(scope.getClass(window.$injector.get('$location').path()));
// => current


// = SECTION CreateEventCtrl
scope = create_controller(CreateEventCtrl);
scope.event.competitions['J&J'][4].show = true;
print(scope.ok_to_save());
// => false
scope.event.name = 'name test';
print(scope.ok_to_save());
// => true
scope.event.description = 'description test';
scope.event.date = today;
scope.event.registration_opens = yesterday;
scope.event.registration_closes = tomorrow;
scope.save();
wait(function(){return scope.success_response || scope.error;}, 10000);

// = SECTION
// seems we need to wait a bit to make sure we get the new data, google app engine is a bit weird...
wait(1000);

// = SECTION
print(scope.success_response);
// => ok
print(scope.error);
// => undefined
get_url('/ajax/list_events/?__get__all__=');

// = SECTION
print(get_url_done);
// => true

print(get_url_result);
/* => {
    events: [
        {
            competitions: {
                "J&J": [
                    ...
                    {name: "Allstar", show: true, value: false},
                    ...
                ],
                ...
            },
            ...
            description: "description test",
            id: "?",
            name: "name test",
            ...
        }
    ],
    ...
}
*/
var event_id = angular.fromJson(get_url_result)['events'][0].id;


// = SECTION EditEventCtrl
scope = create_controller(EditEventCtrl, {$routeParams: {eventId: event_id}});
wait(function(){return scope.event || scope.error;}, 10000);

// = SECTION
print(scope.error);
// => undefined
scope.event.competitions['J&J'][0].show = true;
scope.event.name = 'name test2';
scope.event.description = 'description test2';
print(scope.ok_to_save());
// => true
scope.save();
wait(function(){return scope.success_response || scope.error;}, 10000);

// = SECTION
// seems we need to wait a bit to make sure we get the new data, google app engine is a bit weird...
wait(1000);

// = SECTION
print(scope.success_response);
// => ok
get_url('/ajax/list_events/?__get__all__=');

// = SECTION
print(get_url_result);
/* => {
    events: [
        {
            competitions: {
                "J&J": [
                    {name: "Newcomer", show: true, value: false},
                    ...
                    {name: "Allstar", show: true, value: false},
                    ...
                ],
                ...
            },
            ...
            description: "description test2",
            id: "?",
            name: "name test2",
            ...
        }
    ],
    ...
}
*/


// = SECTION ListEventsCtrl
scope = create_controller(ListEventsCtrl);
wait(function(){return scope.events || scope.error;}, 10000);

// = SECTION
print(scope.error);
// => undefined
print(scope.events.length);
// => 1
print(scope.events[0].name);
// => name test2

// = SECTION SignUpCtrl
scope = create_controller(SignUpCtrl, {$routeParams: {eventId: event_id}});
wait(function(){return scope.event || scope.error;}, 10000);

// = SECTION
print(scope.error);
// => undefined
print(scope.ok_to_register());
// => false
scope.first_name = 'Anders';
scope.last_name = 'Hovmöller';
scope.lead_follow = 'lead';
scope.event.competitions['J&J'][2].value = true;
print(scope.ok_to_register());
// => true
scope.register();
wait(function(){return scope.registration_complete || scope.error;}, 10000);

// = SECTION
print(scope.first_name);
// =>
print(scope.error);
// => undefined
scope.register_another();
wait(function(){return scope.event || scope.error;}, 10000);

// = SECTION
scope.first_name = 'Mârïá';
scope.last_name = 'ÅnnöyingUnicode';
scope.lead_follow = 'follow';
scope.event.competitions['J&J'][1].value = true;
print(scope.ok_to_register());
// => true
scope.register();
wait(function(){return scope.registration_complete || scope.error;}, 10000);

// = SECTION
print(scope.error);
// => undefined


// = SECTION RegistrationsCtrl
scope = create_controller(RegistrationsCtrl, {$routeParams: {eventId: event_id}});
wait(function(){return scope.event || scope.error;}, 10000);

// = SECTION
print(scope.error);
// => undefined
print(scope.has_registrations());
// => true
print(scope.comps);
/* => {
    "J&J Intermediate": [
        {
            first_name: "Anders",
            last_name: "Hovmöller",
            lead_follow: "lead",
            user: ...
        }
    ],
    "J&J Novice": [
        {
            first_name: "Mârïá",
            last_name: "ÅnnöyingUnicode",
            lead_follow: "follow",
            user: ...
        }
    ]
}
*/

// = SECTION FinalsCtrl
scope = create_controller(FinalsCtrl);
print(scope.judges.length);
// => 3
scope.addJudges();
scope.addJudges();
print(scope.judges.length);
// => 7
scope.removeJudges();
print(scope.judges.length);
// => 5
print(scope.couples.length);
// => 1
scope.couples[0] = {nr: '1', leader: 'A', follower: 'A', scores:{1: 1, 2: 1, 3: 3, 4: 2, 5: 3}, chief_judge_score: null}; // 1
scope.couples[1] = {nr: '2', leader: 'B', follower: 'B', scores:{1: 6, 2: 5, 3: 4, 4: 1, 5: 2}, chief_judge_score: null}; // 4
scope.couples[2] = {nr: '3', leader: 'C', follower: 'C', scores:{1: 2, 2: 4, 3: 1, 4: 5, 5: 5}, chief_judge_score: null}; // 3
scope.couples[3] = {nr: '4', leader: 'D', follower: 'D', scores:{1: 4, 2: 2, 3: 5, 4: 6, 5: 6}, chief_judge_score: null}; // 6
scope.couples[4] = {nr: '5', leader: 'E', follower: 'E', scores:{1: 5, 2: 6, 3: 2, 4: 3, 5: 4}, chief_judge_score: null}; // 5
scope.couples[5] = {nr: '6', leader: 'F', follower: 'F', scores:{1: 3, 2: 3, 3: 6, 4: 4, 5: 1}, chief_judge_score: null}; // 2
scope.tabulation = null;
scope.errors = null;
scope.update_state();
wait(function(){return scope.tabulation || scope.errors;}, 10000);

// = SECTION
print(scope.errors);
// => null
print(scope.tabulation);
/* =>
 0 (  0)  3 (  4)  5 ( 10)  5 ( 10)  5 ( 10)  |    1: A, A
 0 (  0)  0 (  0)  3 (  7)  4 ( 11)  4 ( 11)  |    6: F, F
 0 (  0)  0 (  0)  0 (  0)  3 (  7)  5 ( 17)  |    3: C, C
 0 (  0)  0 (  0)  0 (  0)  3 (  7)  4 ( 12)  |    2: B, B
 0 (  0)  0 (  0)  0 (  0)  3 (  9)  4 ( 14)  |    5: E, E
 0 (  0)  0 (  0)  0 (  0)  0 (  0)  3 ( 11)  |    4: D, D
 */
print(scope.scores);
/* =>
[
    {
        chief_judge_score: null,
        judges_scores: [1, 1, 3, 2, 3],
        name: {follower: "A", leader: "A", nr: "1"},
        user_data: null
    },
    {
        chief_judge_score: null,
        judges_scores: [3, 3, 6, 4, 1],
        name: {follower: "F", leader: "F", nr: "6"},
        user_data: null
    },
    {
        chief_judge_score: null,
        judges_scores: [2, 4, 1, 5, 5],
        name: {follower: "C", leader: "C", nr: "3"},
        user_data: null
    },
    {
        chief_judge_score: null,
        judges_scores: [6, 5, 4, 1, 2],
        name: {follower: "B", leader: "B", nr: "2"},
        user_data: null
    },
    {
        chief_judge_score: null,
        judges_scores: [5, 6, 2, 3, 4],
        name: {follower: "E", leader: "E", nr: "5"},
        user_data: null
    },
    {
        chief_judge_score: null,
        judges_scores: [4, 2, 5, 6, 6],
        name: {follower: "D", leader: "D", nr: "4"},
        user_data: null
    }
]
*/
