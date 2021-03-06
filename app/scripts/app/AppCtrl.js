'use strict';

// TODO(filip): refactor this mess ;)
angular.module('ngDependencyGraph')
  .controller('AppCtrl', function($rootScope, $scope, inspectedApp, Const, storage, appContext, currentView) {
    var ctrl = this;

    var templates = {
      ABOUT: 'scripts/about/about.html',
      MAIN: 'scripts/main/main.html',
      LOADING: 'scripts/about/loading.html'
    };

    ctrl.appTemplate = templates.LOADING;

    ctrl.loadSampleApp = function() {
      inspectedApp.loadSampleData();
      ctrl.appTemplate = templates.MAIN;
    };

    ctrl.insertCookieAndRefresh = function() {
      appContext.setDebug(true);
    };

    function init() {
      appContext.getDebug(function(enabled) {
        if (enabled) {
          // app enabled for this page
          inspectedApp.loadInspectedAppData(function() {
            if (ctrl.appTemplate !== templates.MAIN) {
              ctrl.appTemplate = templates.MAIN;
            } else {
              console.log(inspectedApp.getData());
              $scope.$broadcast(Const.Events.INIT_MAIN);
            }
            $scope.$apply();
          });
        } else {
          // cookie not set yet, check if Angular present
          inspectedApp.getAngularVersion(function(version) {
            ctrl.angularVersion = version && version.full;
            ctrl.appTemplate = templates.ABOUT;
            $scope.$apply();
          });
        }
      });
    }

    if (chrome.extension) {
      appContext.watchRefresh(function() {
        // TODO use some polling to check if AngularJS is loaded
        // in reality the inspected app should always be prioritised, but this is asking for trouble
        setTimeout(function() {
          init();
        }, 500);
      });
      init();
    } else {
      // just load sample app, not in a tab, development / test
      ctrl.loadSampleApp();
      $scope.$broadcast('initMain');
    }

  });
