(function(){
  angular.module('app', []);
})();

(function(){
  angular.module('app')
    .controller('mainController', mainController)
    .directive('checkbox', checkbox);

  function mainController() {
    var vm = this;
    vm.test = { greet: "Hello", checked: true };
    vm.test2 = { greet: "Hello2", checked: false, disabled:true };
  }
  
  function checkbox() {
    return {
      require: 'ngModel',
      restrict: 'E',
      template: '<div class="switch"><input type="checkbox" class="toggle-checkbox" id="{{cbName}}" name="{{cbName}}" data-ng-checked="cbChecked" data-ng-model="cbChecked" data-ng-disabled="cbDisabled"><label for="{{cbName}}"></label>',
      scope: {
        cbChecked: "=",
        cbName: "=",
        cbModel: "=",
        cbDisabled: "="
      }
    }
  }
})();