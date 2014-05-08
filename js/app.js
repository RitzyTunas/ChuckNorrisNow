var app = angular.module('myApp', ['ngRoute'])

// .provider() api method is the ONLY method for creating services that can be injected into .config() functions
app.provider('chuckNorris', function(){  // takes a name for the service, and a function defining the actual provider
  
  this.getUrl = function(first, last){
    return 'http://api.icndb.com/jokes/random?firstName='+ first +'&lastName='+ last;
  }

  this.$get = function($q, $http){
    var self = this;
    return {
      getJokes: function(first, last){
      	var deferred = $q.defer();
      	$http({
      	  method: 'GET',
          url: self.getUrl(first, last),
      	  cache: true
      	}).success(function(data){
          deferred.resolve(data);
      	}).error(function(err){
          deferred.reject(err);
      	});
      	return deferred.promise;
      }
    }
  }
})

app.config(function($routeProvider){
  $routeProvider
  .when('/', {
    templateUrl: 'templates/home.html',
    controller: 'MainCtrl'
  })
  .when('/settings', {
    templateUrl: 'templates/settings.html',
    controller: 'SettingsCtrl'
  })
  .otherwise({redirectTo: '/'});
})

// the .provider() api created an injectable object [NAME]Provider, where [NAME] is the first argument you pass into the .provider() api method

// NOTES: controllers are "destroyed" every time we navigate to another page 
// NOTES: services persist across controllers for the duration of the application's lifetime

app.controller('MainCtrl', function($scope, $timeout, chuckNorris, UserService){
  // Build date object
  $scope.date = {};
  $scope.user = UserService.user;
  // Update function
  var updateTime = function(){
  	$scope.date.raw = new Date();
  	$timeout(updateTime, 1000);
  }
  // Start update function
  updateTime();

  chuckNorris.getJokes($scope.user.first, $scope.user.last)
  .then(function(data){
    console.log('aaaaaaaaa',data.value.id);
    var ignore = [2, 45, 51, 58, 69, 70, 128, 137, 150, 158, 180, 191, 193, 213, 223, 228, ,246, 252, 262, 264, 266, 278, 284, 287, 293, 294, 295, 298, 299, 304, 326, 328, 330, 337, 338, 349, 370, 374, 379, 394, 400, 427, 456, 483, 485, 492, 501, 527, 559];
    if (ignore.indexOf(data.value.id) !== -1) {
      $scope.jokes = $scope.user.first + ' ' + $scope.user.last + ' once made a round trip to the end of the internet and back.'
    } else {
      $scope.jokes = data.value;
      if ($scope.user.gender === "male") {
        $scope.jokes = Encoder.htmlDecode(data.value.joke);
      } else {
        var jokes = Encoder.htmlDecode(data.value.joke);
        jokes = jokes.replace(/\bhe\b/g, 'she');
        jokes = jokes.replace(/\bhis\b/g, 'her');
        jokes = jokes.replace(/\bhim\b/g, 'her');
        jokes = jokes.replace(/\bHe\b/g, 'She');
        jokes = jokes.replace(/\bHis\b/g, 'Her');
        jokes = jokes.replace(/\bHim\b/g, 'Her');
        jokes = jokes.replace(/\bHE\b/g, 'SHE');
        jokes = jokes.replace(/\bHIS\b/g, 'HER');
        jokes = jokes.replace(/\bHIM\b/g, 'HER');
        jokes = jokes.replace(/\bhimself\b/g, 'herself');
        jokes = jokes.replace(/\bman\b/g, 'woman');
        jokes = jokes.replace(/\bwomen\b/g, 'men');
        $scope.jokes = jokes;
      }  
    }
  }); 
});

app.factory('UserService', function($location){
  var defaults = {
    first: 'Chuck',
    last: 'Norris',
    gender: 'male',
    color: '#FBFBEF;'
  };
  
  var service = {
    user: {},
    save: function(){
      sessionStorage.CNNow = angular.toJson(service.user);
      $location.path('/');
    },
    restoreDefault: function(){
      service.user = {
        first: 'Chuck',
        last: 'Norris',
        gender: 'male',
        color: '#FBFBEF;'
      };
      sessionStorage.CNNow = angular.toJson(service.user);
      $location.path('/');
    },
    restore: function(){
      service.user = angular.fromJson(sessionStorage.CNNow) || defaults
      return service.user;
    }
  };
  service.restore();
  return service;
})

app.controller('SettingsCtrl', function($scope, UserService){
  $scope.user = UserService.user;
  $scope.save = function(){
    UserService.save();
  }
  $scope.restoreDefault = function(){
    UserService.restoreDefault();
  }
});


