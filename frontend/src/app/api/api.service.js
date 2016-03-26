'use strict';

angular.module('frontend').service("API", ['$http', '$q', '$location', function(http, q, $location) {
    return {
        getAPIEndpoint: function()
        {
            // Localhost?
            if ( $location.host() == 'localhost' )
            {
                return 'http://localhost:3000';
            }

            // Otherwise, return production endpoint
            return 'http://applicationize.com';
        }
}}]);
