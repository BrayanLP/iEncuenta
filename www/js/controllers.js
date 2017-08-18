angular.module('starter.controllers', ['ngCookies','chart.js'])

.controller('AppCtrl', function($scope,$state , $ionicModal,$ionicPopup, $timeout, $ionicLoading,$cookies, $ionicPlatform, $rootScope, $ionicHistory) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // $ionicPlatform.ready(function() {
  //   setTimeout(function() {
  //       navigator.splashscreen.hide();
  //   }, 300);
  // });

  // Form data for the login modal
  // $scope.loginData = {};
  $scope.data = {};
  // $scope.add = {};
  // Create the login modal that we will use later 
  $ionicModal.fromTemplateUrl('templates/registro.html', { 
    scope: $scope, 
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.cerrar_modal = function(index) {
    if(index === 1){
      $scope.modal.hide();
    }
  };

  // Open the login modal
  $scope.abrir_modal = function(index) {
    if(index === 1){
      $scope.modal.show();
      $scope.add = [];
      $scope.add.email = '';
    }
  };

  $scope.getSesion = function(){
    var data = $cookies.get('accesos');  
    $scope.data = JSON.parse(data); 
    return $scope.data;
  };


  //Escucha algun cambio con respecto a la sesión
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) { 
      if(user.emailVerified){  
        $state.go('app.ramas');
        $scope.getSesion();  
        $scope.email = user.email;
        $scope.foto = user.photoURL; 
        $rootScope.nombre_completo = user.displayName;   
      }  
      else{ 
        $state.go('verificacion');
        $scope.getSesion(); 
        $scope.email = user.email; 
      } 

    } 
    else{  
      if(user !== null){
        if(user.emailVerified === false){  
          // $scope.abrir_modal(2);
          $scope.email = user.email;
        }
        
      }
      else{
        $state.go('login');
        $scope.getSesion(); 
        // $scope.limpiar_campos();
      } 
    }
  });

  //login de usuario
  $scope.loginEmail = function(){   
    firebase.auth().signInWithEmailAndPassword($scope.data.email,$scope.data.password)
      .then(function(firebaseUser){  
        $cookies.putObject('accesos', $scope.data); 
        $cookies.putObject('uid', firebaseUser.uid);
        $scope.cargando();  
      }).catch(function(error){
        if(error.code === "auth/wrong-password"){
          $scope.mensaje_contrasena = "* Contraseña incorrecta.";
          $scope.$digest();
          $timeout(function(){
              $scope.mensaje_contrasena = "";
            },5000);
        }
        else if(error.code === "auth/user-not-found"){
          $scope.mensaje_correo = "* Correo Electrónico no registrado.";
          $scope.$digest();
          $timeout(function(){
              $scope.mensaje_correo = "";
            },5000);
        } 
      }); 
  };
  //cerrar sesion del usuario
  $scope.logOutEmail = function(){
    firebase.auth().signOut().then(function() {
      console.log('cerrando sesion');   
    }, function(error) {
      console.log(error);
    });
  };

  $scope.signupEmail = function (formName, add) {

      if (formName.$valid) {
        firebase.auth().createUserWithEmailAndPassword(add.email, add.password).then(function (result) {  
          result.sendEmailVerification();
          $scope.cargando();  
          $scope.cerrar_modal(1);
          $scope.temp = {
            email: add.email,
            password: add.password 
          };
          // $window.sessionStorage.setItem("recuerdo",JSON.stringify($scope.temp));  
          result.updateProfile({
              displayName: add.name,
              photoURL: "https://www.1plusx.com/app/mu-plugins/all-in-one-seo-pack-pro/images/default-user-image.png"
            }).then(function() {
              firebase.database().ref('usuarios').child(result.uid).set({
                nombre_completo: add.name,
                correo: add.email
              });

              
            }, function(error) {
              console.log(error);
            }); 
          }, function (error) {
            if(error.code  === "auth/email-already-in-use"){
              $scope.mensaje = "* Correo Electrónico ya está en uso por otra cuenta."; 
              $scope.$digest();
              $timeout(function(){
                  $scope.mensaje = "";
                },5000);
            }
            // sharedUtils.hideLoading();
            // sharedUtils.showAlert("Please note","Sign up Error");
          });

      }else{
        // sharedUtils.showAlert("Please note","Entered data is not valid");
      }

  }; 
  // $scope.modal();
  $scope.limpiar_campos = function(){
    if($scope.data.recordar !== true){
      // $window.sessionStorage.removeItem("recuerdo");
      $scope.data = {};
      $scope.data.username = '';
      $scope.data.password = '';
      $scope.data.recordar = '';  
    }
  };

  $scope.cargando = function(){
    $ionicLoading.show({ 
      content: '<i class="icon ion-looping"></i> Cargando ...', 
      animation: 'fade-in', 
      showBackdrop: true, 
      maxWidth: 400, 
      showDelay: 0
    });
    $timeout(function () {
      
      $ionicLoading.hide(); 
    }, 2000);
  };

  $scope.init = function(){ 
    $state.reload(true);
    $state.go('app.examenes');
    $scope.cargando();
  };

})

.controller('ramaCtrl', function($scope, $state,$cookies, $ionicPlatform, $ionicPopup, $ionicHistory) { 
  $scope.cargando();
  $scope.lista = function(){
    var ramas = firebase.database().ref('ramas');
    ramas.on('value' , function(snapshot) {  
      $scope.data_capitulos = snapshot.val();  
    }); 
  };
  $scope.lista(); 

  $scope.getNombre = function(n){  
    $cookies.putObject('nombre', n);
  };
  // console.log($state.current.name);
  var redirect = $ionicPlatform.registerBackButtonAction(
    function() {
      // if(
      //     $state.current.name === 'app.examenes' || 
      //     $state.current.name === 'app.ayuda' ||
      //     $state.current.name === 'app.cuenta'
      //   ){
        
      // }
      if($state.current.name === 'app.ramas'){
        $ionicPopup.confirm({
          title: 'Esta seguro de salir !',
          content: 'Presione el boton ok para salir.'
        }).then(function(res) {
          if(res) {
            ionic.Platform.exitApp();
          } else {
            console.log('continuar en la app');
          }
        });  
      }
      else{
        $ionicHistory.goBack();  
      }
      // alert("This isx the first page")
    }, 100
  );
  $scope.$on('$destroy', redirect);


})

.controller('capituloCtrl', function($scope, $stateParams,$cookies, $state, $ionicLoading, $timeout, $ionicHistory) { 
  $scope.nombre = $cookies.getObject('nombre');
  var id_cat = $stateParams.categoriaId;  
  var capitulo = firebase.database().ref('capitulo/' + id_cat);
  capitulo.on('value' , function(response) {   
    var dataLoad = response.val();  
    // console.log(dataLoad); 
    $scope.data_categoria = [];
    var i = 0; 
    angular.forEach(dataLoad, function(value, key){ 
      var temp = parseInt(key.split('_')[2]);
      var obj = {
        key : key,
        value: value,
        id: temp
      };
      $scope.data_categoria.push(obj); 
    });
  });

  $scope.preguntas = function(key) { 
    $scope.data_temp      = []; 
    $scope.data_preguntas = [];
    $scope.data_preguntas = [];

    if(key !== ''){
      var cap = firebase.database().ref('preguntas/' +id_cat +'/'+ key);
      cap.on('value', function(response) {   
        $scope.data_pre = response.val(); 
        angular.forEach($scope.data_pre, function(value,i){  
          value.pre = i; 
          $scope.data_temp.push(value);  
        }); 
        $scope.preguntas_random(15, $scope.data_temp);   
        $ionicHistory.clearCache().then(function(){ $state.go('preguntas');});
        $scope.cargando("1500");
      });    
    }
    else{  
      console.log("ocurrio algo al generar"); 
    }
  }; 

  $scope.preguntas_random = function(cantidad, zoo) {
    this.cantidad = cantidad;
    this.zoo = zoo;
    var tamano = zoo.length; 
    var lote = [];
    var indice = 0;
    do {
      var aleatorio = zoo[ parseInt(Math.random()* tamano) ];
      if(lote.indexOf(aleatorio)!=-1){
        continue;
      }else{
        lote[indice]=aleatorio;
        indice++;
      }
    } 
    while(lote.length < cantidad); 
    $scope.data_preguntas = lote;
    $scope.generarUid();
  };

  $scope.generarUid = function(){
    //Escucha algun cambio con respecto a la sesión
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) { 
        if(user.emailVerified){     
          $scope.key = firebase.database().ref('usuarios').child(user.uid).child('examenes').push().key;   
          var examen = firebase.database().ref('usuarios').child(user.uid).child('examenes');
          var updateExamen = {};
          updateExamen[$scope.key] = true; 
          examen.update(updateExamen); 

          var objExamen = JSON.stringify($scope.data_preguntas);
          var examenes = firebase.database().ref('examenes');
          var updateExamenes = {};
          updateExamenes[$scope.key] = objExamen; 
          examenes.update(updateExamenes); 

          $cookies.putObject('key', $scope.key);
          // console.log($cookies.getAll());
          
        } 
      } 
    });
  }; 

  $scope.cargando = function(time){
    $ionicLoading.show({ 
      content: '<i class="icon ion-looping"></i> Cargando ...', 
      animation: 'fade-in', 
      showBackdrop: true, 
      maxWidth: 400, 
      showDelay: 0
    });
    $timeout(function () {
      $ionicLoading.hide(); 
    }, time);
  };

})

.controller('capitulosCtrl', function($scope ,$state ,$rootScope ,$stateParams ,$cookies, $ionicLoading, $timeout, $ionicHistory ) { 
  var id_url = $stateParams.capitulosId; 
  $scope.nombre = $cookies.getObject('nombre');
  var capitulos = firebase.database().ref('capitulos/' + id_url);
  capitulos.on('value' ,function(response) {   
    $scope.data_capitulo = response.val();     
  });  

  $scope.preguntas_random = function(cantidad, zoo) {
    this.cantidad = cantidad;
    this.zoo = zoo;
 
    var tamano = zoo.length; 
    var lote = [];
 
    var indice = 0;
    do {
      var aleatorio = zoo[ parseInt(Math.random()* tamano) ];
      if(lote.indexOf(aleatorio)!=-1){
        continue;
      }else{
        lote[indice]=aleatorio;
        indice++;
      }
    } 
    while(lote.length < cantidad); 
    $scope.data_preguntas = lote;
    $scope.generarUid(); 
  };

  $scope.preguntas = function(key) { 
    $scope.data_temp      = []; 
    $scope.data_preguntas = [];
    $scope.data_preguntas = [];

    if(key !== ''){
      var cap = firebase.database().ref('preguntas/' + key);
      cap.on('value', function(response) {   
        $scope.data_pre = response.val(); 
        angular.forEach($scope.data_pre, function(value,i){ 
          angular.forEach(value, function(child ,j){  
            child.pre = j; 
            $scope.data_temp.push(child); 
          }); 
        }); 
        $scope.preguntas_random(30, $scope.data_temp);    
        $ionicHistory.clearCache().then(function(){ $state.go('preguntas');});
        $scope.cargando("1500");
      });    
    }
    else{  
      console.log("ocurrio algo al generar");
      // var detalle_pre = firebase.database().ref('preguntas/' + key);
      // detalle_pre.once('value', function(response) {   
      //   $scope.data_preguntas = response.val();  
      //   // console.log($scope.data_preguntas);  
      //   $state.go('preguntas'); 
      // });  
    }
  }; 

  $scope.generarUid = function(){
    //Escucha algun cambio con respecto a la sesión
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) { 
        if(user.emailVerified){     
          $scope.key = firebase.database().ref('usuarios').child(user.uid).child('examenes').push().key;   
          var examen = firebase.database().ref('usuarios').child(user.uid).child('examenes');
          var updateExamen = {};
          updateExamen[$scope.key] = true; 
          examen.update(updateExamen); 

          var objExamen = JSON.stringify($scope.data_preguntas);
          var examenes = firebase.database().ref('examenes');
          var updateExamenes = {};
          updateExamenes[$scope.key] = objExamen; 
          examenes.update(updateExamenes); 

          $cookies.putObject('key', $scope.key);
          console.log($cookies.getAll());
          
        } 
      } 
    });
  }; 
  $scope.cargando = function(time){
    $ionicLoading.show({ 
      content: '<i class="icon ion-looping"></i> Cargando ...', 
      animation: 'fade-in', 
      showBackdrop: true, 
      maxWidth: 400, 
      showDelay: 0
    });
    $timeout(function () {
      $ionicLoading.hide(); 
    }, time);
  };

})

.controller('preguntasCtrl', function($scope ,$state ,$ionicPopup ,$ionicScrollDelegate ,$timeout ,$cookies ,$filter ,$ionicLoading, $window, $ionicPlatform, $ionicHistory ) { 
  var redirect = $ionicPlatform.registerBackButtonAction(
    function() {
      $ionicPopup.alert({
        title: 'Quieres Salir?',
        content: 'Tienes que finalizar las preguntas antes de salir.'
      }).then(function(res) {
      });
    }, 100
  );

  $scope.$on('$destroy', redirect);
  $scope.nombre = $cookies.getObject('nombre');
  $scope.key = $cookies.getObject('key');
  // console.log($cookies.getAll());
  $scope.currentPage = 0;
  $scope.pageSize = 1;
  $scope.q = '';

  $scope.bueno = 0;
  $scope.malo = 0;
  $scope.nulo = 0;

  $scope.loadPreguntas = function(){
    var examen = firebase.database().ref('examenes/'+ $scope.key);
    examen.on('value' , function(snapshot) {  
      $scope.data = JSON.parse(snapshot.val());    
    }); 
  };

  // $scope.cargarPreguntar = function(){
  //   angular.forEach(pre,function(value,i){
  //     var pregunta = firebase.database().ref('preguntas/'+value.capitulo+'/'+value.sub_capitulo);
  //     // var updateExamenes = {};
  //     var obj = { 
  //           [value.id]: {
  //             titulo: value.pregunta,
  //             ops: {
  //               o_1: value.o_1,
  //               o_2: value.o_2,
  //               o_3: value.o_3,
  //               o_4: value.o_4
  //             },
  //             res: value.resultado,
  //             det: value.detalle
  //           }
  //     };
  //     // updateExamenes[$rootScope.key] = obj; 
  //     // pregunta.update(obj); 
  //     console.log(obj);
  //   });
  // };

  $scope.pasar = function(id){
    $scope.cargando("1500");
    var id_obj = id; 
    $scope.data.push($scope.data[id_obj]); 
    $scope.data.splice(id_obj,1); 
    $scope.generarUid($scope.data, $scope.key);
  };

  // $scope.removerPregunta = function(id){
  //   $scope.cargando("500");
  //   var id_obj = id;  
  //   $scope.data.splice(id_obj,1); 
  //   $cookies.putObject('preguntas', $scope.data); 
  //   // $cookies.putObject('preguntas_temp', $scope.data_temp);
  //   console.log($scope.data_temp);  
  // };

  $scope.finalizar = function(){ 
    // console.log($scope.data);
    $scope.data = [];
    // console.log($scope.data);
    $scope.cargando('1500');  
    $state.go('felicidades');  
  };
 
  $scope.generarUid = function(data,key){ 
    var objExamen = JSON.stringify(data);
    var examenes = firebase.database().ref('examenes');
    var updateExamenes = {};  
    updateExamenes[key] = objExamen; 
    examenes.update(updateExamenes);  
  };

  $scope.initGrafico = function(){
    $scope.labels = ["Preguntas Correctas", "Preguntas Incorrectas", "Perguntas sin Marcar"];
    $scope.colors = ["#008000","#ff0000","#d4d4d4"];
    $scope.grafico = [$scope.bueno, $scope.malo, $scope.nulo];
  };

  $scope.confirmar_examen = function() {
    $ionicPopup.confirm({
      title: 'Culminar Examen',
      content: 'Estas seguro de culminar el examen?'
    }).then(function(res) {
      if(res) {
        $scope.finalizar();
        $timeout.cancel(timer_object);
      } else {
        console.log('continuar examen');
      }
    });
  };

  $scope.check = function(){ 
    $scope.generarUid($scope.data, $scope.key);
  };

  $scope.cargando = function(time){
    $ionicLoading.show({ 
      content: '<i class="icon ion-looping"></i> Cargando ...', 
      animation: 'fade-in', 
      showBackdrop: true, 
      maxWidth: 400, 
      showDelay: 0
    });
    $timeout(function () {
      $ionicLoading.hide(); 
    }, time);
  };

  $scope.cambioPagina = function() {
    $ionicScrollDelegate.scrollTop(0);
  };

  $scope.anterior = function(){
    $scope.currentPage = $scope.currentPage - 1;
    $scope.cambioPagina();
  };

  $scope.siguiente = function(){
    $scope.currentPage = $scope.currentPage + 1;
    $scope.cambioPagina();
  };

  $scope.counter = 60 * 90;
  // $scope.counter = 100;
  $scope.tiempoPorPregunta = function(){
    $scope.counter--;
    timer_object = $timeout($scope.tiempoPorPregunta,1000);
    if ($scope.counter === 0) { 
      $timeout.cancel(timer_object);
      $scope.finalizar();
    } 
  };

  $scope.tiempoPorPregunta();
  $scope.loadPreguntas();

  $scope.getData = function () { 
    return $filter('filter')($scope.data, $scope.q)
  };
  $scope.numberOfPages=function(){
    return Math.ceil($scope.getData().length/$scope.pageSize);                
  };
  console.log($ionicHistory);
  // $ionicPlatform.registerBackButtonAction(function(){
  //   console.log($ionicHistory.currentStateName);
  //   if($ionicHistory.currentStateName === 'someStateName'){
  //     event.preventDefault();
  //   }else{
  //     $ionicHistory.goBack();
  //   }
  // }, 100);

})

.controller('felicidadesCtrl', function($scope ,$state ,$rootScope ,$ionicPopup ,$ionicPlatform ,$ionicScrollDelegate ,$stateParams ,$timeout ,$cookies ,$filter ,$ionicLoading ) {     
  var redirect = $ionicPlatform.registerBackButtonAction(
    function() {
      // alert("This isx the first page")
      $ionicPopup.alert({
        title: 'Importante !',
        content: 'No es posible retroceder.'
      }).then(function(res) {
      });
    }, 100
  );
  $scope.$on('$destroy', redirect);
  $scope.nombre = $cookies.getObject('nombre');
  var llave = $cookies.getObject('key');
  $scope.key =llave;  
  $scope.initData = function(){
    angular.forEach($scope.data, function( value, i){ 
      if(value.res_temp == null || value.res_temp == ''){
        $scope.nulo += 1; 
      } 
      else if(value.res == value.res_temp){
        $scope.bueno += 1; 
      }
      else if(value.res != value.res_temp){
        $scope.malo += 1; 
      }
      else{
        console.log("error no identificado");
      }
    }); 
    $scope.initGrafico();
  };

  $scope.loadPreguntas = function(){
    $scope.cargando('1500');
    var preguntas = firebase.database().ref('examenes/'+ $scope.key);
    preguntas.on('value' , function(snapshot) {  
      $scope.data = JSON.parse(snapshot.val());    
      $scope.initData();
      console.log($scope.data, $scope.key);
    }); 
  };
  

  $scope.bueno = 0;
  $scope.malo = 0;
  $scope.nulo = 0; 


  $scope.pasar = function(id){
    $scope.cargando("2000");
    var id_obj = id; 
    $scope.data.push($scope.data[id_obj]); 
    $scope.data.splice(id_obj,1); 
    $cookies.putObject('preguntas', $scope.data);  
  };

  $scope.removerPregunta = function(id){
    $scope.cargando("500");
    var id_obj = id;  
    $scope.data.splice(id_obj,1); 
    $cookies.putObject('preguntas', $scope.data); 
    // $cookies.putObject('preguntas_temp', $scope.data_temp);
    console.log($scope.data_temp);  
  };

  $scope.finalizar = function(){ 
    $state.go('felicidades');  
    $scope.cargando('1500');   
  };

  $scope.getSesion = function(){
    var data = $cookies.get('accesos');  
    $scope.sesionData = JSON.parse(data); 
    return $scope.sesionData;
  };
 
  $scope.generarUid = function(data,key){ 
    
    var objExamen = JSON.stringify(data);
    var examenes = firebase.database().ref('examenes');
    var updateExamenes = {};  
    updateExamenes[key] = objExamen; 
    examenes.update(updateExamenes);  
  };

  $scope.initGrafico = function(){
    /* Gráfico*/
    $scope.labels = ["Preguntas Correctas", "Preguntas Incorrectas", "Perguntas sin Marcar"];
    $scope.colors = ["#008000","#ff0000","#d4d4d4"]
    $scope.grafico = [$scope.bueno, $scope.malo, $scope.nulo];
  };

  $scope.cargando = function(time){
    $ionicLoading.show({ 
      content: '<i class="icon ion-looping"></i> Cargando ...', 
      animation: 'fade-in', 
      showBackdrop: true, 
      maxWidth: 400, 
      showDelay: 0
    });
    $timeout(function () {
      $ionicLoading.hide(); 
    }, time);
  };

  $scope.salir = function(){
    $scope.data = [];
    // $cookies.putObject('preguntas',$scope.data);
    // $cookies.putObject('preguntas_temp', $scope.data); 
    $scope.cargando('1500');
    console.log($cookies.getAll());
    $state.go('app.ramas'); 
  };

  $scope.loadPreguntas();

})

.controller('detalleCtrl',function($scope ,$stateParams ,$state, $ionicModal,$filter ,$timeout,$ionicScrollDelegate ,$ionicLoading, $ionicPlatform, $ionicPopup){
  var redirect = $ionicPlatform.registerBackButtonAction(
    function() {
      // alert("This isx the first page")
      $ionicPopup.alert({
        title: 'Importante !',
        content: 'No es posible retroceder.'
      }).then(function(res) {
      });
    }, 100
  );
  $scope.$on('$destroy', redirect);
  var id_detalle = $stateParams.detalleId;
  $scope.loadPreguntas = function(){
    var preguntas = firebase.database().ref('examenes/'+id_detalle);
    preguntas.on('value' , function(snapshot) {  
      $scope.detallePreguntas = JSON.parse(snapshot.val());   
      // console.log("entre");
    }); 
  }

  $scope.loadPreguntas();

  $scope.currentPage = 0;
  $scope.pageSize = 1;
  $scope.q = '';


  $scope.getData = function () { 
    return $filter('filter')($scope.detallePreguntas, $scope.q);
  }

  $scope.numberOfPages=function(){
    return Math.ceil($scope.getData().length/$scope.pageSize);                
  }
 

  $scope.cambioPagina = function() {
    $ionicScrollDelegate.scrollTop(0);
  };

  $scope.anterior = function(){
    $scope.currentPage = $scope.currentPage - 1;
    $scope.cambioPagina();
  };

  $scope.siguiente = function(){
    $scope.currentPage = $scope.currentPage + 1;
    $scope.cambioPagina();
  };
  
  $ionicModal.fromTemplateUrl('templates/modalDetalle.html', { 
      scope: $scope, 
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
  });

  $scope.cerrar_modal = function() { 
    $scope.modal.hide(); 
  };

  // Open the login modal
  $scope.abrir_modal = function() {
    $scope.modal.show();
  };

  $scope.cargando = function(time){
    $ionicLoading.show({ 
      content: '<i class="icon ion-looping"></i> Cargando ...', 
      animation: 'fade-in', 
      showBackdrop: true, 
      maxWidth: 400, 
      showDelay: 0
    });
    $timeout(function () {
      $ionicLoading.hide(); 
    }, time);
  };

  $scope.salir = function(){
    $scope.data = [];
    $scope.cargando('1500');
    $state.go('app.ramas'); 
  };


})

.controller('examenesCtrl', function($scope ,$state ,$rootScope ,$ionicPopup ,$ionicPlatform ,$ionicScrollDelegate ,$stateParams ,$timeout ,$cookies ,$filter ,$ionicLoading, $ionicHistory ){  
  $scope.nombre = $cookies.getAll(); 
  $scope.result = [];  
  $scope.currentPage = 0;
  $scope.pageSize = 4;
  $scope.q = '';   
  $scope.loadInit = function(){  
    if($scope.loadExamenes != null){ 
      $scope.mostrarGraficos(); 
    }
    else{ 
      $scope.mostrarGraficos(); 
    }
  }

  $scope.mostrarGraficos = function(){
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) { 
        if(user.emailVerified){    
          // $scope.keys = [];  
          if($scope.keys != undefined){
            $scope.loadPreguntas();
          }
          else{
            var examenes = firebase.database().ref('usuarios').child(user.uid).child('examenes');
            examenes.on('value' , function(snapshot) {  
              $scope.getExamenes = snapshot.val();     
              $scope.loadPreguntas($scope.getExamenes);
            });

          }
        } 
      } 
    });
  };

  $scope.loadPreguntas = function(data){ 
    if(data){
      // $scope.keys = $cookies.get('keys');
      if($scope.keys != undefined){  
        angular.forEach($scope.keys, function(value){
          var examenesKey = firebase.database().ref('examenes/'+ value);
          examenesKey.on('value' , function(snapshot) {  
            $scope.getExamen = JSON.parse(snapshot.val());    
            $scope.generandoResultados($scope.getExamen, value); 
          }); 

        })
      }
      else{ 
        $scope.keys = []; 
        angular.forEach(data, function(value,i){  
          // $scope.keys.push(i);
          // $cookies.putObject('keys', $scope.keys);
          var examenesKey = firebase.database().ref('examenes/'+ i);
          examenesKey.on('value' , function(snapshot) {  
            $scope.getExamen = JSON.parse(snapshot.val());    
            $scope.generandoResultados($scope.getExamen, i);
            
          }); 
        }); 
      } 
    }
    else{
      $scope.keys = []; 
      angular.forEach(data, function(value,i){ 
        // $scope.keys.push(i);
        // $cookies.putObject('keys', $scope.keys);
        var examenesKey = firebase.database().ref('examenes/'+ i);
        examenesKey.on('value' , function(snapshot) {  
          $scope.getExamen = JSON.parse(snapshot.val());    
          $scope.generandoResultados($scope.getExamen, value); 
        }); 
      });
    }
    
  };

  $scope.generandoResultados = function(data,key){
    $scope.nulo = 0;
    $scope.bueno = 0;
    $scope.malo = 0;
    var obj = {};
    angular.forEach(data, function( value, i){ 
      if(value.res_temp == null || value.res_temp == ''){
        $scope.nulo += 1; 
      } 
      else if(value.res == value.res_temp){
        $scope.bueno += 1; 
      }
      else if(value.res != value.res_temp){
        $scope.malo += 1; 
      }
      else{
        console.log("error no identificado");
      }
    }); 
    obj = { 
        'nulo': $scope.nulo,
        'bueno': $scope.bueno,
        'malo': $scope.malo,
        'key': key
    }; 
    $scope.result.push(obj); 
    // $cookies.putObject('examenes', $scope.result); 
    $scope.loadExamenes = $scope.result;
    console.log($scope.loadExamenes);
    $scope.$digest();     
  };

  $scope.initGrafico = function(){
    /* Gráfico*/
    $scope.labels = ["Preguntas Correctas", "Preguntas Incorrectas", "Perguntas sin Marcar"];
    $scope.colors = ["#008000","#ff0000","#d4d4d4"]
    // $scope.grafico = [10, 15, 7];
  };
  
  $scope.refresh = function(){
    $state.reload(true); 
    $ionicHistory.clearCache().then(function(){ $state.go('app.examenes');});
  };

  $scope.limpiar = function(){
    $cookies.remove('examenes',[]); 
    $scope.loadExamenes = []; ;
  };

  $scope.cargando = function(time){
    $ionicLoading.show({ 
      content: '<i class="icon ion-looping"></i> Cargando ...', 
      animation: 'fade-in', 
      showBackdrop: true, 
      maxWidth: 400, 
      showDelay: 0
    });
    $timeout(function () {
      $ionicLoading.hide(); 
    }, time);
  };

  $scope.actualizar = function(id){ 
    $state.reload(true); 
  }
  
  $scope.getData = function () { 
    return $filter('filter')($scope.loadExamenes, $scope.q)
  };
  $scope.numberOfPages = function(){
    return Math.ceil($scope.getData().length/$scope.pageSize);                
  };

  $scope.cambioPagina = function() {
    $ionicScrollDelegate.scrollTop(0);
  };

  $scope.anterior = function(){
    $scope.currentPage = $scope.currentPage - 1;
    $scope.cambioPagina();
  };

  $scope.siguiente = function(){
    $scope.currentPage = $scope.currentPage + 1;
    $scope.cambioPagina();
  };

  // $cookies.remove('keys',[]);
  // $cookies.remove('examenes',[]);
  $scope.initGrafico();
  $scope.loadInit();

})

.controller('cuentaCtrl', function($scope, $cookies, $ionicHistory, $state, $rootScope, $timeout){

  $scope.uid = $cookies.getObject('uid');
  $scope.mensajeNombre = false;
  $scope.mensajeContra = false;
  $scope.mensajeErrorContra == false;
  $scope.mensajeErrorCoinciden = false;
  // $scope.nombre_completo = 'prueba';
  // $scope.getInfo = {};
  // $scope.getInfo.pass = '';
  // $scope.getInfo.pass2 = '';
  // console.log($scope.uid);
  // console.log($cookies.getAll());
  console.log($cookies.getAll());
  // console.log();
  var usuario = firebase.database().ref('usuarios/' + $scope.uid);
  usuario.on('value' , function(response) {   
    $scope.getInfo = response.val();
    $scope.temp = response.val();  
    console.log($scope.getInfo.nombre_completo); 
    $scope.$digest(); 
  });

  $scope.actualizarData = function(){ 
    if(
      $scope.getInfo.nombre_completo != $scope.temp.nombre_completo && 
      $scope.getInfo.nombre_completo != '' && $scope.getInfo.nombre_completo != undefined &&
      $scope.getInfo.pass  != '' && $scope.getInfo.pass  != undefined && 
      $scope.getInfo.pass2 != '' && $scope.getInfo.pass2 != undefined && 
      $scope.getInfo.pass === $scope.getInfo.pass2
       ){
      console.log("estoy modificando todo"); 
      $scope.actualizarNombre();
      $scope.actualizarContrasena(); 
      $scope.getInfo.pass = '';
      $scope.getInfo.pass2 = ''; 

    }
    else if(
      $scope.getInfo.nombre_completo === $scope.temp.nombre_completo &&  
      ($scope.getInfo.pass  != '' && $scope.getInfo.pass != undefined) &&
      ($scope.getInfo.pass2 != '' && $scope.getInfo.pass2 != undefined ) &&
      $scope.getInfo.pass === $scope.getInfo.pass2
      ){
      console.log('estoy modificando solo la contraseña'); 
      $scope.actualizarContrasena(); 
      $scope.getInfo.pass = '';
      $scope.getInfo.pass2 = '';
    }
    else if(
      $scope.getInfo.nombre_completo !=  $scope.temp.nombre_completo && 
      $scope.getInfo.nombre_completo != '' && $scope.getInfo.nombre_completo != undefined
      ){
      $scope.actualizarNombre();
      $scope.getInfo.pass = '';
      $scope.getInfo.pass2 = '';
      // console.log("estoy modificando solo el nombre"); 
    }
    else if(
      $scope.getInfo.pass != $scope.getInfo.pass2 &&
      $scope.getInfo.nombre_completo === $scope.temp.nombre_completo
      ){
      console.log("contrasenas no coinciden");
      $scope.contraNoCoincide();
      $scope.getInfo.pass = '';
      $scope.getInfo.pass2 = '';
    }
    else{
      console.log("no hice nada");
      $scope.getInfo.pass = '';
      $scope.getInfo.pass2 = '';
    }
  }

  $scope.actualizarNombre = function(){
    var data = firebase.database().ref('usuarios').child($scope.uid);
    var user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: $scope.getInfo.nombre_completo
    }).then(function() {
      // Update successful.
      data.update({'nombre_completo':$scope.getInfo.nombre_completo});
      $scope.$apply(function(){
        $rootScope.nombre_completo = $scope.getInfo.nombre_completo;
        $scope.mensajeNombre = true;
      })
      $scope.getInfo.pass = '';
      $scope.getInfo.pass2 = '';
      $timeout(function () { 
          $scope.mensajeNombre = false;
        }, 5000); 
      $scope.$digest();
    }, function(error) {
    });

  };

  $scope.actualizarContrasena = function(){
    if($scope.getInfo.pass === $scope.getInfo.pass2){
      var user = firebase.auth().currentUser;
      user.updatePassword($scope.getInfo.pass).then(function() {
        var obj = {
          email: $cookies.getObject('accesos').email,
          password: $scope.getInfo.pass
        }
        $scope.$apply(function(){
          $cookies.putObject('accesos',obj);
          $scope.mensajeContra = true;
        }); 
        $scope.cerrarSesion();
        $timeout(function () { 
          $scope.mensajeContra = false;
        }, 5000);
      }, function(error) {
        $scope.mensajeErrorContra = true; 
        $scope.$digest();
        $timeout(function () { 
          $scope.mensajeErrorContra = false; 
        }, 5000);
        console.log(error);
      });
    }
  };

  $scope.contraNoCoincide = function(){
    $scope.mensajeErrorCoinciden = true;
    $timeout(function () { 
      $scope.mensajeErrorCoinciden = false;
    }, 5000);
  }
  $scope.cerrarSesion = function(){
    firebase.auth().signOut().then(function() {
      console.log('cerrando sesion');   
    }, function(error) {
      console.log(error);
    });
  };
})

.controller('recuperarClaveCtrl',function($scope, $state, $timeout,$rootScope){
  $scope.email = "";
  $scope.recuperarPassword = function(email){
    var auth = firebase.auth();
    $scope.data = {};
    // var email = $scope.email;
    console.log(email);
    if(email != undefined){ 
      auth.sendPasswordResetEmail(email).then(function() { 
        $scope.mensaje_aceptado = 'Revisé su de correo electrónico';
        $scope.email = ""; 
        $scope.$digest();
        $timeout(function(){
          $scope.mensaje_aceptado = "";
          $state.go('login');
        },3000);
      }, function(error) {
        if(error.code == "auth/user-not-found"){
          console.log(error);
          $scope.mensaje_correo = '* El correo electrónico no esta registrado.';
          $scope.$digest();
          $timeout(function(){
            $scope.mensaje_correo = "";
          },3000);
        }
        else if(error.code == "auth/argument-error"){
          $scope.mensaje_correo = '* El campo email esta vacío.';
          $scope.$digest();
          $timeout(function(){
            $scope.mensaje_correo = "";
          },3000);
        }
        // An error happened.
      });
    }
    else{
      $scope.mensaje_correo = '* El campo email esta vacío.';
      $scope.$digest();
      $timeout(function(){
        $scope.mensaje_correo = "";
      },3000);  
    }
  }
})

.controller('ayudaCtrl',function ($scope){

})

.filter('startFrom', function() {
    return function(input, start) {
        if (!input || !input.length) { return; }
        start = +start; //parse to int
        return input.slice(start);
    };
})

// .filter('toArray', function() { return function(obj) {
//     if (!(obj instanceof Object)) return obj;
//     return _.map(obj, function(val, key) {
//         return Object.defineProperty(val, '$key', {__proto__: null, value: val.key.split('_')});
//     });
// }})

.filter('secondsToDateTime', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);
