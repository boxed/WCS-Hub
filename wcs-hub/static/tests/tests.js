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