angular.module('WCSHub', []).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/finals/:state', {templateUrl: 'partials/finals.html', controller: FinalsCtrl}).
            when('/finals', {templateUrl: 'partials/finals.html', controller: FinalsCtrl}).
            when('/events', {templateUrl: 'partials/event_list.html', controller: EventListCtrl}).
            when('/events/create', {templateUrl: 'partials/edit_event.html', controller: CreateEventCtrl}).
            when('/events/:eventId/edit', {templateUrl: 'partials/edit_event.html', controller: EditEventCtrl}).
            when('/events/:eventId/sign_up', {templateUrl: 'partials/sign_up.html', controller: SignUpCtrl}).
            when('/events/:eventId/registrations', {templateUrl: 'partials/registrations.html', controller: RegistrationsCtrl}).
            otherwise({redirectTo: '/events/'});
    }]).
    directive('checkbox', function() {
        return {
            templateUrl: '/partials/checkbox.html',
            restrict: 'EA',
            scope: {
                title: "=ngTitle",
                target: "=ngModel"
            },
            controller: function ($scope, $http, $attrs, $element) {
                if ($attrs.ngShow) {
                    $scope.$parent.$watch($attrs.ngShow, function(value) {
                        $element.css('display', !!value ? '' : 'none');
                    });
                }
                $scope.toggle = function() {
                    $scope.target = !$scope.target;
                };
            }
        }
    });

function available_competitions() {
    var f = {};
    for (var i in this.competitions) {
        for (var j in this.competitions[i]) {
            if (this.competitions[i][j].show) {
                f[i] = this.competitions[i];
                break;
            }
        }
    }
    return f;
}

function empty_event() {
    var r = {};
    r.name = '';
    r.description = '';
    r.date = new Date();
    r.registration_opens = new Date();
    r.registration_closes = new Date();
    function classes() {
        return [
            {name: 'Newcomer',     value: false, show: false},
            {name: 'Novice',       value: false, show: false},
            {name: 'Intermediate', value: false, show: false},
            {name: 'Advanced',     value: false, show: false},
            {name: 'Allstar',      value: false, show: false}
        ];
    }
    r.competitions = {
        'J&J': classes(),
        Strictly: classes(),
        Routines: [
            {name: 'Classic',  value: false, show: false},
            {name: 'Showcase', value: false, show: false},
            {name: 'Teams',    value: false, show: false},
            {name: 'Cabaret',  value: false, show: false}
        ]
    };
    // TODO: other categories: Adv/allstar in J&J and strictly
    return r;
}

//// Controllers //////////////////////////////////////////////////////////

function MenuCtrl($scope, $location) {
    $scope.getClass = function(path) {
        if ($location.path() == path) {
            return "current"
        } else {
            return ""
        }
    }}

function EventListCtrl($scope, $routeParams, $http) {
    $scope.events = [];

    $http.get('/ajax/list_events/'
        ).success(function(data) {
            $scope.events = data.events;
            $scope.user = data.user;
        }).error(function(data) {
        });
}

function RegistrationsCtrl($scope, $http, $routeParams) {
    $scope.events = [];

    $http.get('/ajax/registrations/?'+$routeParams.eventId
        ).success(function(data) {
            $scope.event = data.event;
            $scope.user = data.user;
            $scope.comps = data.comps;
        }).error(function(data) {
        });
}

function event_has_chosen_comp($scope) {
    var comps = false;
    var available_comps = $scope.event.available_competitions();
    for (var i in available_comps) {
        for (var j in available_comps[i]) {
            if (available_comps[i][j].show) {
                comps = true;
                break;
            }
        }
    }
    return comps;
}

function has_chosen_comp($scope) {
    var comps = false;
    var available_comps = $scope.event.available_competitions();
    for (var i in available_comps) {
        for (var j in available_comps[i]) {
            if (available_comps[i][j].value) {
                comps = true;
                break;
            }
        }
    }
    return comps;
}

function SignUpCtrl($scope, $http, $routeParams) {
    if (!$scope.event) {
        $http.get('/ajax/event/?'+$routeParams.eventId
            ).success(function(data) {
                $scope.event = data;
                $scope.event.available_competitions = available_competitions;
            }).error(function(data) {
            });
    }
    $scope.ok_to_register = function() {
        if (!$scope.event) {
            return false;
        }
        return $scope.first_name !== '' && $scope.last_name !== ''  && $scope.lead_follow && has_chosen_comp($scope);
    };
    $scope.register = function() {
        $http.post('/ajax/register/', {
                    event: angular.toJson($scope.event),
                    first_name: $scope.first_name,
                    last_name: $scope.last_name,
                    lead_follow: $scope.lead_follow
                }
            ).success(function(data){
                $('.container').html('Thank you for registering!');
            }).error(function(data){
                $scope.error = data;
            });
    };
}

function CreateEventCtrl($scope, $http, $routeParams) {
    $scope.title = 'Create event';
    $scope.event = empty_event();
    $scope.is_sign_up_preview = true;
    $scope.event.available_competitions = available_competitions;

    $scope.create = function() {
        $http.post('/ajax/create_event/', {event: angular.toJson($scope.event)}
            ).success(function(data){
                $('.container').html('Event created!');
            }).error(function(data){
                $scope.error = data;
            });
    };

    function update_state() {
        $routeParams.state = angular.toJson({
            event: $scope.event
        });
    }

    $scope.ok_to_save = function() {
        if (!$scope.event) {
            return false;
        }
        return $scope.event.name !== '' && event_has_chosen_comp($scope);
    };

    $scope.$watch('event', update_state, objectEquality=true);
}

function EditEventCtrl($scope, $http, $routeParams) {
    $scope.title = 'Edit event';
    $scope.is_sign_up_preview = true;
    if (!$scope.event) {
        $http.get('/ajax/event/?'+$routeParams.eventId
            ).success(function(data) {
                $scope.event = data;
            }).error(function(data) {
            });
    }

    $scope.ok_to_save = function() {
        if (!$scope.event) {
            return false;
        }
        return $scope.event.name !== '';
    };

    $scope.save = function() {
        $http.post('/ajax/edit_event/', {event: angular.toJson($scope.event)}
            ).success(function(data){
                $('.container').html('Event edited!');
            }).error(function(data){
                $scope.error = data;
            });
    };
}

function FinalsCtrl($scope, $http, $routeParams) {
    function empty_row() {
        return {nr: '', leader: '', follower: '', scores: {}, chief_judge_score: ''};
    }

    $scope.couples = [
        empty_row()
    ];
    $scope.judges = [
        1, 2, 3
    ];
    $scope.showRP = false;

    function update_state(new_val, old_val) {
        if ($scope.couples.slice(-1)[0].nr !== '') {
            $scope.couples.push(empty_row());
        }
        if (angular.toJson($scope.couples.slice(-2)) === angular.toJson([empty_row(), empty_row()])) {
            $scope.couples.pop();
        }
        $http.get('/ajax/calculate_rp/?'+encodeURI(angular.toJson({couples: $scope.couples, judges: $scope.judges}))
            ).success(function(data){
                data = angular.fromJson(data);
                $scope.tabulation = data.tabulation;
                $scope.scores = data.scores;
                $scope.errors = null;
            }).error(function(data){
                $scope.errors = data.errors;
                $scope.placement = null;
            });
    }

    $scope.$watch('couples', update_state, objectEquality=true);
    $scope.$watch('judges', update_state, objectEquality=true);

    $scope.addJudges = function() {
        $scope.judges.push($scope.judges.length+1);
        $scope.judges.push($scope.judges.length+1);
    };

    $scope.removeJudges = function() {
        $scope.judges.pop();
        $scope.judges.pop();
    };
}
function update_menu(){
    $('.menu li').each(function(i, item){
        var a = $(item).children('a');
        var foo = window.location.pathname;
        if (window.location.hash.substring(1)) {
            foo = '/#'+window.location.hash.substring(1);
        }
        if (a && a.attr('href') == foo) {
            $(item).addClass('current');
        }
    });
}

$(document).ready(function() {
    if ($('input').length) {
        $('input')[0].focus();
    }
    $('.button').live('mousedown', function(){
        $(this).addClass('pushed');
    }).live('mouseup', function(){
        $(this).removeClass('pushed');
    });
    update_menu();
});