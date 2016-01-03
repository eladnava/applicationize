'use strict';

angular.module('frontend')
  .controller('MainCtrl', function ($scope, $location, $routeParams, $timeout, $mdToast, API)
    {
        // Not loading by default
        $scope.loading = false;
        
        // Return path to /generate API route
        $scope.getGenerateAPIEndpoint = function()
        {
            return API.getAPIEndpoint() + '/generate';
        }
        
        $scope.formSubmit = function()
        {
            // Show loading spinner
            $scope.loading = true;
            
            // TODO: Find a better way to detect file download (or navigation cancelled event)
            $timeout(function()
            {
                $scope.loading = false;
            }, 3000);
        }
    });
