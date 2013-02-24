angular.module('WCSHub', []).directive('checkbox', function() {
    return {
        templateUrl: '/static/checkbox.html',
        restrict: 'EA',
        scope: {},
        controller: function ($scope, $http, $attrs, $element, $parse) {
            var target = $parse($attrs.ngModel);
            $scope.title = $attrs.title;
            $scope.checked = target($scope.$parent);
            if ($attrs.ngShow) {
                $scope.$parent.$watch($attrs.ngShow, function(value) {
                    $element.css('display', !!value ? '' : 'none');
                });
            }
            $scope.toggle = function() {
                target.assign($scope.$parent, !$scope.checked);
            };
            $scope.$parent.$watch($attrs.ngModel, function(new_val) {
                $scope.checked = new_val;
            });
        }
    }
});

function empty_event() {
    var r = {};
    r.name = '';
    r.date = new Date();
    r.registration_opens = new Date();
    r.registration_closes = new Date();
    r.jnj_newcomer = false;
    r.jnj_novice = false;
    r.jnj_intermediate = false;
    r.jnj_advanced = false;
    r.jnj_all_star = false;
    r.strictly_newcomer = false;
    r.strictly_novice = false;
    r.strictly_intermediate = false;
    r.strictly_advanced = false;
    r.strictly_all_star = false;
    // TODO: other categories: Adv/allstar in J&J and strictly, routines: http://www.usopenswingdc.com/compete.html, pro-am
    return r;
}

function SignUpCtrl($scope, $location, $http) {
}

function CreateEventCtrl($scope, $location, $http) {
    $scope.event = empty_event();

    $scope.create = function() {

    };
}

//SignUpCtrl.prototype = Object.create(CreateEventCtrl.prototype);


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
        $http.get('/finals/?'+encodeURI(angular.toJson({couples: $scope.couples, judges: $scope.judges}))).success(function(data){
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
    $('input')[0].focus();
    $('.button').live('mousedown', function(){
        $(this).addClass('pushed');
    }).live('mouseup', function(){
        $(this).removeClass('pushed');
    });
});