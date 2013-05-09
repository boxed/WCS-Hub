'use strict';

angular.module('WCSHub', ['ui']).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/finals/:state', {templateUrl: 'partials/finals.html', controller: FinalsCtrl}).
            when('/finals', {templateUrl: 'partials/finals.html', controller: FinalsCtrl}).
            when('/events', {templateUrl: 'partials/event_list.html', controller: ListEventsCtrl}).
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
    }).value('ui.config', {
        date: {
            dateFormat: "yy-mm-dd"
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
            {name: 'Allstar',      value: false, show: false},
            {name: 'Masters',      value: false, show: false}
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
            return "current";
        } else {
            return "";
        }
    }
}

function ListEventsCtrl($scope, $http) {
    $scope.events = [];

    $http.get('/ajax/list_events/'
        ).success(function(data) {
            $scope.events = data.events;
            $scope.user = data.user;
        }).error(function(data) {
            $scope.error = data;
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
            $scope.error = data;
        });

    $scope.has_registrations = function() {
        return !$.isEmptyObject($scope.comps);
    };
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
    $scope.read_event = function() {
        $http.get('/ajax/event/?'+$routeParams.eventId
            ).success(function(data) {
                $scope.event = data;
                $scope.event.available_competitions = available_competitions;
            }).error(function(data) {
                $scope.error = data;
            });
    };
    if (!$scope.event) {
        $scope.read_event();
    }

    $scope.ok_to_register = function() {
        if (!$scope.event) {
            return false;
        }
        return $scope.first_name !== '' && $scope.last_name !== ''  && $scope.lead_follow !== '' && has_chosen_comp($scope);
    };
    $scope.register = function() {
        $http.post('/ajax/register/', {
                    event: angular.toJson($scope.event),
                    first_name: $scope.first_name,
                    last_name: $scope.last_name,
                    lead_follow: $scope.lead_follow,
                    wsdc_number: $scope.wsdc_number
                }
            ).success(function(data){
                $scope.registration_complete = true;
                $scope.event = undefined;
                $scope.first_name = '';
                $scope.last_name = '';
                $scope.lead_follow = undefined;
            }).error(function(data){
                $scope.error = data;
            });
    };
    $scope.register_another = function() {
        $scope.registration_complete = false;
        $scope.read_event();
    };

    $scope.choose_wsdc_number = function(){
        $scope.wsdc_number = this.result.value;
    };

    $scope.$watch('lead_follow', function() {
        if ($scope.lead_follow && $scope.first_name && $scope.last_name) {
            $http.get('/ajax/search_wsdc/?'+encodeURIComponent($scope.last_name+','+$scope.first_name)).success(function(data){
                $scope.wsdc_search_result = angular.fromJson(data);
            });
        }
    }, true);
}

function CreateEventCtrl($scope, $http, $routeParams) {
    $scope.title = 'Create event';
    $scope.event = empty_event();
    $scope.is_sign_up_preview = true;
    $scope.event.available_competitions = available_competitions;

    $scope.save = function() {
        $http.post('/ajax/create_event/', {event: angular.toJson($scope.event)}
            ).success(function(data){
                $scope.event_updated_message = 'Event created!';
                $scope.success_response = data;
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

    $scope.$watch('event', update_state, true);
}

function EditEventCtrl($scope, $http, $routeParams) {
    $scope.title = 'Edit event';
    $scope.is_sign_up_preview = true;
    if (!$scope.event) {
        $http.get('/ajax/event/?'+$routeParams.eventId
            ).success(function(data) {
                $scope.event = data;
            }).error(function(data) {
                $scope.error = data;
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
                $scope.event_updated_message = 'Event edited!';
                $scope.success_response = data;
            }).error(function(data){
                $scope.error = data;
            });
    };
}

function FinalsCtrl($scope, $http) {
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

    $scope.update_state = function() {
        if ($scope.couples.slice(-1)[0].nr !== '' || $scope.couples.slice(-1)[0].leader !== '') {
            $scope.couples.push(empty_row());
        }
        if (angular.toJson($scope.couples.slice(-2)) === angular.toJson([empty_row(), empty_row()])) {
            $scope.couples.pop();
        }
        $http.post('/ajax/calculate_rp/',
            angular.toJson({couples: $scope.couples, judges: $scope.judges})
            ).success(function(data){
                data = angular.fromJson(data);
                $scope.tabulation = data.tabulation;
                $scope.scores = data.scores;
                $scope.errors = null;
            }).error(function(data){
                data = angular.fromJson(data);
                $scope.errors = data.errors;
                $scope.scores = null;
                $scope.tabulation = null;
            });
    };

    $scope.$watch(function(){return [$scope.couples, $scope.judges];}, $scope.update_state, true);

    $scope.addJudges = function() {
        $scope.judges.push($scope.judges.length+1);
        $scope.judges.push($scope.judges.length+1);
    };

    $scope.removeJudges = function() {
        $scope.judges.pop();
        $scope.judges.pop();
    };
}

$(document).ready(function() {
    setTimeout(function(){
        if ($('input').length) {
            $('input')[0].focus();
        }
    }, 10);
    $('.button').live('mousedown', function(){
        $(this).addClass('pushed');
    }).live('mouseup', function(){
        $(this).removeClass('pushed');
    });
});