function empty_row() {
    return {nr: '', leader: '', follower: '', scores: {}, chief_judge_score: ''};
}

function focusedInputIndex() {
    var result = 0;
    angular.forEach($('input'), function(item, i) {
        if (i == document.activeElement) {
            result = i;
        }
    });
    return result;
}

function FinalsCtrl($scope, $location, $http) {
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
});