 /****************************************************************************************
 *
 *  USER FACTORY
 *  @version (.1)
 *  @date (2015)
 *
 *****************************************************************************************/
 define(['./module'], function (factories) {
    factories.factory('userFactory', ['$http', 
        function ($http) {
        var userFactory = {

            verifyUser: function(criteria) {

                var xhrRequest = {
                    headers: {'Content-Type': 'application/json'},
                    method: 'post',
                    url: '/login',
                    data: criteria
                };

                return $http(xhrRequest)
                    .then(function (response) {
                        return response.data;
                    })
            }
        }

        return userFactory;
    }]);
 });