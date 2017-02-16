'use strict';

angular.module('games')
.controller('GameListController', ['games', 'gameService', function(games, gameService) {
    var vm = this;
    vm.games = games;
    vm.service = gameService;
}]);
