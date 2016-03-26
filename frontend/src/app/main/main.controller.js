'use strict';

angular.module('frontend')
    .controller('MainCtrl', function($scope, $timeout, API) {
        // Not loading by default
        $scope.loading = false;

        // Return path to /generate API route
        $scope.getGenerateAPIEndpoint = function() {
            return API.getAPIEndpoint() + '/generate';
        };

        $scope.formSubmit = function($event) {
            // No URL?
            if (!$scope.url) {
                alert('Please enter a valid web app URL to applicationize.');
                return $event.preventDefault();
            }
            
            // Verify protocol
            if ($scope.url.substring(0, 4) !== 'http') {
                alert('Please provide a valid URL. (It must start with http(s)://)');
                return $event.preventDefault();
            }

            // Show loading spinner
            $scope.loading = true;

            // TODO: Find a better way to detect file download (or navigation cancelled event)
            $timeout(function() {
                $scope.loading = false;
            }, 3000);
        };
    });
