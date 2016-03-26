'use strict';

/* Generate form action workaround for Angular security */
angular.module('frontend')
    .directive('setGenerateAction', [function () {
        return {
            link: function (scope, element) {
                $(element).attr('action', scope.getGenerateAPIEndpoint());
            }
        };
    }]);