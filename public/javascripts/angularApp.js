var app = angular.module('awesomeBoard', ['ui.router']);

app
.factory('teams', ['$http', function($http) {
    var o = {
        teams: [],
        boards: []
    };

    o.get = function(id) {
        return $http.get('/teams/' + id).then(function(res) {
            return res.data;
        });
    };

    o.getAll = function() {
        return $http.get('/teams').then(function(res) {
            angular.copy(res.data, o.teams);
            return res.data;
        });
    };

    o.create = function(team) {
        return $http.post('/teams', team).then(function(res) {
            o.teams.push(res.data);
            return res.data;
        });
    };

    o.addBoard = function(teamId, board) {
      return $http.post('/teams/' + teamId + '/boards', board).then(function(res) {
        o.boards.push(res.data);
        return res.data;
      });
    };

    o.getBoards = function(teamId) {
      return $http.get('/teams/' + teamId + '/boards').then(function(res) {
        angular.copy(res.data, o.boards);
        return res.data;
      });
    };



  return o;
}]);

app
.controller('MainCtrl', [
    '$scope',
    '$filter',
    'teams',
    function($scope, $filter, teams) {
        $scope.teams = teams.teams;
        $scope.boards = teams.boards;
        $scope.data = {
          teamSelect: '',
          boardSelect: ''
        };

        $scope.addTeam = function() {
            if(!$scope.teamName || $scope.teamName === '') {
                return;
            }
            teams.create({
                name: $scope.teamName
            }).then(function(team){
              $scope.teams = teams.teams;
              $scope.team = team;
              $scope.teamName = '';
              $scope.data.teamSelect = team;
            });
        };

        $scope.addBoard = function() {
            if(!$scope.team || $scope.data.teamSelect === '' || !$scope.boardName || $scope.boardName === '') {
                return;
            }
            var board = {
              name: $scope.boardName
            };
            teams.addBoard($scope.data.teamSelect._id, board)
                 .then(function(board) {
              $scope.boards = teams.boards;
              $scope.board = board;
              $scope.boardName = '';
              $scope.data.boardSelect = board;
            });
        };

        $scope.getTeam = function() {
          if($scope.data.teamSelect === '') {
            $scope.team = null;
            $scope.board = null;
            $scope.boards = [];
            $scope.data.boardSelect = '';
            return;
          }
          $scope.team = teams.get($scope.data.teamSelect._id);
          teams.getBoards($scope.data.teamSelect._id);
          $scope.boards = teams.boards;
          $scope.data.boardSelect = '';
        };

        $scope.getBoard = function() {
          if($scope.data.boardSelect === '') {
            return;
          }
          $scope.board = $filter('filter')($scope.boards, {_id:$scope.data.boardSelect})[0];
        };
    }
]);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl',
        resolve: {
            postPromise: ['teams', function(teams) {
                return teams.getAll();
            }]
        }
    })
    .state('teams', {
        url: '/teams/{id}',
        templateUrl: '/teams.html',
        controller: 'TeamsCtrl',
        resolve: {
            team: ['$stateParams', 'teams', function($stateParams, teams) {
                return teams.get($stateParams.id);
            }]
        }
    });

    $urlRouterProvider.otherwise('home');
}]);