angular.module('starter')

.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {
  $scope.username = AuthService.username();
 
  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });
 
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });
 
  $scope.setCurrentUsername = function(name) {
    $scope.username = name;
  };
})

.controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService) {
  $scope.data = {};
 
  $scope.login = function(data) {
    AuthService.login(data.username, data.password).then(function(authenticated) {
      $state.go('main.dash', {}, {reload: true});
      $scope.setCurrentUsername(data.username);
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  };
})

.controller('ChatsCtrl', function($scope, $http, $ionicModal, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
  $ionicModal.fromTemplateUrl('query.html', function(modal){
    $scope.queryModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });
  
  $ionicModal.fromTemplateUrl('new-task.html', function(modal){
    $scope.taskModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });  
  
  $scope.newTask = function(){
    $scope.taskModal.show();
  };
  
  $scope.closeNewTask = function(){
    $scope.taskModal.hide();
  };  
  
  $scope.showQuery = function(){
    $scope.queryModal.show();
  };
  
  $scope.closeQuery = function(){
    $scope.queryModal.hide();
  };

  $scope.fetchWO = function(scr) {

    $http.get('http://www.chesterfield.mo.us/cmss_files/mytest.php?type=searchWO', {
    }, {
      headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    })
    .success(function(data,status,headers,config){
      //console.log(data);
      $scope.chats = data;
      Chats.chats = data;
      if(scr==1)
        $scope.$broadcast('scroll.refreshComplete');
    })
    .error(function(data,status,headers,config){
      console.error('Err', data);
    });
  };
  
  $scope.searchQuery = function(qr){
    
    $http.get('http://www.chesterfield.mo.us/cmss_files/mytest.php?type=searchWO'
      +'&woStatus='+qr.woStatus+'&assignedTo='+qr.assignedTo)
    .success(function(data,status,headers,config){
      $scope.chats = data;
      Chats.chats = data;
      console.log(data);
      $scope.closeQuery();
    })
    .error(function(data,status,headers,config){
      console.error('Err', data);
    });
  };
  
  $scope.remove = function(chat) {
      $scope.chats.splice($scope.chats.indexOf(chat), 1);
  };
  
  $scope.doRefresh = function() {
    $scope.fetchWO(1);
  };
  
  $scope.fetchWO(0);
 
})

.filter('periodToArray', function(){
  return function(text){
    //console.log(text);
    a = text.split('.');
    a.pop();
    return a;
  };
})

.controller('ChatDetailCtrl', function($scope, $http, $stateParams, $ionicModal, Chats) {
    
    $ionicModal.fromTemplateUrl('new-task.html', function(modal){
      $scope.taskModal = modal;
    }, {
      scope: $scope,
      animation: 'slide-in-up'
    });
    
    $http.get('http://www.chesterfield.mo.us/cmss_files/mytest.php?type=loadWO&id='+$stateParams.chatId, {
    }, {
      headers: {
          'Access-Control-Allow-Origin': '*'
      }
    })
    .success(function(data,status,headers,config){
      $scope.chat = data;
      //Chats.chats = data;
      console.log($scope.chat.serialno+", "+$scope.chat.desc);
      //Chats.chats = data;
    })
    .error(function(data,status,headers,config){
      console.error('Err', data);
    });
  
  $scope.apm = Chats.get($stateParams.chatId, Chats.chats);
  
  $scope.newTask = function(){
    $scope.taskModal.show();
  };
  
  $scope.closeNewTask = function(){
    $scope.taskModal.hide();
  };

  $scope.createTask = function(pm){
    //var url = 'http://www.chesterfield.mo.us/cmss_files/mytest.php?type=deleteWO&id=';
      //+ $stateParams.chatId+'&manHr='+pm.manHr+'&solution='+pm.solution+'&started='+pm.started+'&completed='+pm.completed;
    //alert('http://www.chesterfield.mo.us/cmss_files/mytest.php?type=deleteWO&id='
     // + $stateParams.chatId+'&manHr='+pm.manHr+'&solution='+pm.solution+'&started='+pm.started+'&completed='+pm.completed);
    
    $http.get('http://www.chesterfield.mo.us/cmss_files/mytest.php?type=deleteWO&id='
      + $stateParams.chatId+'&manHr='+pm.manHr+'&solution='+pm.solution+'&started='+pm.started+'&completed='+pm.completed)
    .success(function(data,status,headers,config){
      //$scope.chat = data;
      //Chats.chats = data;
      console.log(data);
      //if(data=="1")
        $scope.closeNewTask();
      //Chats.chats = data;
    })
    .error(function(data,status,headers,config){
      console.error('Err', data);
    });
    
    //alert('hello');
    
  };
      
})

.controller('DashCtrl', function($scope, $state, $http, $ionicPopup, AuthService) {
  $scope.logout = function() {
    AuthService.logout();
    $state.go('login');
  };
 
  $scope.performValidRequest = function() {
    $http.get('http://localhost:8100/valid').then(
      function(result) {
        $scope.response = result;
      });
  };
 
  $scope.performUnauthorizedRequest = function() {
    $http.get('http://localhost:8100/notauthorized').then(
      function(result) {
        // No result here..
      }, function(err) {
        $scope.response = err;
      });
  };
 
  $scope.performInvalidRequest = function() {
    $http.get('http://localhost:8100/notauthenticated').then(
      function(result) {
        // No result here..
      }, function(err) {
        $scope.response = err;
      });
  };
});

