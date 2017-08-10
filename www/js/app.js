angular.module('starter', ['ionic', 'firebase', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() { 
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app', 
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('login', {
    url: '/login',   
    templateUrl: 'templates/login.html',
    controller: 'AppCtrl' 
  })

  .state('registro', {
    url: '/registro', 
    templateUrl: 'templates/registro.html',
    controller: 'AppCtrl'
  })

  .state('verificacion', {
    url: '/verificacion', 
    templateUrl: 'templates/verificacion.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.ramas', {
    url: '/ramas',
    views: {
      'menuContent': {
        templateUrl: 'templates/rama.html',
        controller: 'ramaCtrl'
      }
    }
  })

  .state('app.capitulos', {
    url: '/ramas/:capitulosId',
    views: {
      'menuContent': {
        templateUrl: 'templates/capitulos.html',
        controller: 'capitulosCtrl'
      }
    }
  })

  .state('app.capitulo', {
    url: '/capitulo/:categoriaId',
    views: {
      'menuContent': {
        templateUrl: 'templates/capitulo.html',
        controller: 'capituloCtrl'
      }
    }
  })

  .state('preguntas', {
    url: '/preguntas',  
    templateUrl: 'templates/preguntas.html',
    controller: 'preguntasCtrl' 
  })

  .state('felicidades', {
    url: '/felicidades',  
    templateUrl: 'templates/felicidades.html',
    controller: 'felicidadesCtrl' 
  })

  .state('detallePreguntas', {
    url: '/felicidades/:detalleId', 
    templateUrl: 'templates/detallePreguntas.html',
    controller: 'detalleCtrl'  
  })
  
  .state('resultados', {
    url: '/resultados', 
    templateUrl: 'templates/resultados.html',
    controller: 'preguntasCtrl'
  })



  .state('app.browse', {
    url: '/browse',
    views: {
      'menuContent': {
        templateUrl: 'templates/browse.html'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
