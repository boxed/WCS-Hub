angular.module('WCSHub', []).directive('checkbox', function() {
    return {
        templateUrl: '/static/checkbox.html',
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

function IndexCtrl($scope, $location, $http) {
    $scope.events = [];

    $http.get('/ajax/list_events/'
    ).success(function(data) {
        $scope.events = data;
    }).error(function(data) {
    });
}


function SignUpCtrl($scope, $location, $http) {
    if (!$scope.event) {
        $http.get('/ajax/event/?'+angular.toJson($location.path())
        ).success(function(data) {
            $scope.event = data;
            $scope.event.competitions = angular.fromJson($scope.event.competitions);
            $scope.event.available_competitions = available_competitions;
        }).error(function(data) {
        });
    }
    $scope.ok_to_register = function() {
        if (!$scope.event) {
            return false;
        }
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
        return $scope.first_name && $scope.last_name && $scope.lead_follow && comps;
    };
    $scope.register = function() {
        $http.post('/ajax/register/', {
                event: angular.toJson($scope.event),
                first_name: $scope.first_name,
                last_name: $scope.last_name,
                lead_follow: $scope.lead_follow
            }
        ).success(function(data){

        }).error(function(data){

        });
    };
}

function CreateEventCtrl($scope, $location, $http) {
    $scope.event = empty_event();
    $scope.is_sign_up_preview = true;
    if ($location.path()) {
        var state = angular.fromJson($location.path().slice(1));
        $scope.event = state.event;
    }
    $scope.event.available_competitions = available_competitions;

    $scope.create = function() {
        $http.post('/ajax/create_event/', {event: angular.toJson($scope.event)}
        ).success(function(data){

        }).error(function(data){

        });
    };

    function update_state() {
        $location.path(angular.toJson({
            event: $scope.event
        }));
    }

    $scope.$watch('event', update_state, objectEquality=true);
}

function FinalsCtrl($scope, $location, $http) {
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
    if ($location.path()) {
        var state = angular.fromJson($location.path().slice(1));
        $scope.couples = state.couples;
        $scope.judges = state.judges;
    }

    function update_state(new_val, old_val) {
        if ($scope.couples.slice(-1)[0].nr !== '') {
            $scope.couples.push(empty_row());
        }
        if (angular.toJson($scope.couples.slice(-2)) === angular.toJson([empty_row(), empty_row()])) {
            $scope.couples.pop();
        }
        $location.path(angular.toJson({
            couples: $scope.couples,
            judges: $scope.judges
        }));
        $http.get('/ajax/calculate_rp/?'+encodeURI(angular.toJson({couples: $scope.couples, judges: $scope.judges}))).success(function(data){
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

$(document).ready(function() {
    if ($('input').length) {
        $('input')[0].focus();
    }
    $('.button').live('mousedown', function(){
        $(this).addClass('pushed');
    }).live('mouseup', function(){
        $(this).removeClass('pushed');
    });
});