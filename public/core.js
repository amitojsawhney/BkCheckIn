angular.module('bk_checkin', [])
    .controller('mainController', function($scope, $http) {
        $scope.names = []
        $scope.markedPresent = [];

        var vm = this;

        vm.libData = {};

        vm.addLib = function() {

            $http.post('https://novabluekey.herokuapp.com/register', {
                'personName': vm.libData.name

            });
            vm.libData = {
                'personName': vm.libData.name
            };
        };


        vm.upNext = function() {

            $http.post('http://localhost:8080/upNext', {


                'personName': vm.libData.name

            }).then(function(response) {
                //success
                if (response.status === 200) {
                    console.log(response);
                    if ($scope.names.length) {
                        $scope.names = [];
                    }
                    response.data.forEach(function(user) {
                    $scope.names.push(user.name);
                    });
                }
            }, function(response) {
                console.log(response);
            });


            vm.libData = {
                'personName': vm.libData.name
            };

        };

        //init


        vm.attendanceMarked = function() {

            $http.post('http://localhost:8080/attendanceMarked', {
                'personName': vm.libData.name

            }).then(function(response) {
                //success
                if (response.status === 200) {
                    console.log(response);
                    if ($scope.markedPresent.length) {
                        $scope.markedPresent = [];
                    }
                    response.data.forEach(function(user) {
                    $scope.markedPresent.push(user.name);
                    });
                }
            }, function(response) {
                console.log(response);
            });


              var index = $scope.names.indexOf(vm.libData.name);


            vm.libData = {
                'personName': vm.libData.name
            };
        };

        vm.attendanceMarked();


        vm.gaveTour = function() {

            $http.post('https://novabluekey.herokuapp.com/gaveTour', {
                'personName': vm.libData.name

            });
            vm.libData = {
                'personName': vm.libData.name
            };
        };

        vm.deskTimes = function() {

            $http.post('https://novabluekey.herokuapp.com/deskTimes', {
                'personName': vm.libData.name

            });
            vm.libData = {
                'personName': vm.libData.name
            };
        };

        //init
          vm.upNext();
        //closing brackets
    });
