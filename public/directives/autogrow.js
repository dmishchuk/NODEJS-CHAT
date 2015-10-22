/**
 * Created by dmishchuk on 07/07/2014.
 */

angular.module('myChat').directive('autogrow', function () {

    return {
        restrict: 'A',
        link: function(scope, element) {
            element.bind('keydown', function () {
                var userCols = element[0].scrollHeight;
                if(userCols > 52 && userCols < 120) {
                    element.css('height', userCols);
                }
            });
        }
    }

});