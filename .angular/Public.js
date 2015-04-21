(function() {
    'use strict';

    let angular = global.angular = {};
    module.exports = (function() {
        angular = {
            // 'bootstrap': bootstrap,
            //'copy': copy,
            //'extend': extend,
            //'equals': equals,
            // 'element': jqLite,
            //'forEach': forEach,
            //'injector': createInjector,
            'noop': function() {},
            //'bind': bind,
            //'toJson': toJson,
            //'fromJson': fromJson,
            //'identity': identity,
            //'isUndefined': isUndefined,
            //'isDefined': isDefined,
            //'isString': isString,
            //'isFunction': isFunction,
            //'isObject': isObject,
            //'isNumber': isNumber,
            // 'isElement': isElement,
            //'isArray': isArray,
            //'version': version,
            //'isDate': isDate,
            //'lowercase': lowercase,
            //'uppercase': uppercase,
            //'callbacks': {counter: 0},
            //'getTestability': getTestability,
            //'$$minErr': minErr,
            //'$$csp': csp,
            //'reloadWithDebugInfo': reloadWithDebugInfo
        };

        let angularModule = require('../bower_components/angular/src/loader')(global);

        try {
          angularModule('ngLocale');
        } catch (e) {
          angularModule('ngLocale', []).provider('$locale', $LocaleProvider);
        }

        angularModule('ng', ['ngLocale'], [ '$provide',
            function ngModule($provide) {
                $provide.provider({
                    $$sanitizeUri: $$SanitizeUriProvider
                });
                $provide.provider('$compile', $CompileProvider).directive({
                    a: htmlAnchorDirective,
                    input: inputDirective,
                    textarea: inputDirective,
                    form: formDirective,
                    script: scriptDirective,
                    select: selectDirective,
                    style: styleDirective,
                    option: optionDirective,
                    ngBind: ngBindDirective,
                    ngBindHtml: ngBindHtmlDirective,
                    ngBindTemplate: ngBindTemplateDirective,
                    ngClass: ngClassDirective,
                    ngClassEven: ngClassEvenDirective,
                    ngClassOdd: ngClassOddDirective,
                    ngCloak: ngCloakDirective,
                    ngController: ngControllerDirective,
                    ngForm: ngFormDirective,
                    ngHide: ngHideDirective,
                    ngIf: ngIfDirective,
                    ngInclude: ngIncludeDirective,
                    ngInit: ngInitDirective,
                    ngNonBindable: ngNonBindableDirective,
                    ngPluralize: ngPluralizeDirective,
                    ngRepeat: ngRepeatDirective,
                    ngShow: ngShowDirective,
                    ngStyle: ngStyleDirective,
                    ngSwitch: ngSwitchDirective,
                    ngSwitchWhen: ngSwitchWhenDirective,
                    ngSwitchDefault: ngSwitchDefaultDirective,
                    ngOptions: ngOptionsDirective,
                    ngTransclude: ngTranscludeDirective,
                    ngModel: ngModelDirective,
                    ngList: ngListDirective,
                    ngChange: ngChangeDirective,
                    pattern: patternDirective,
                    ngPattern: patternDirective,
                    required: requiredDirective,
                    ngRequired: requiredDirective,
                    minlength: minlengthDirective,
                    ngMinlength: minlengthDirective,
                    maxlength: maxlengthDirective,
                    ngMaxlength: maxlengthDirective,
                    ngValue: ngValueDirective,
                    ngModelOptions: ngModelOptionsDirective
                }).directive({
                    ngInclude: ngIncludeFillContentDirective
                }).directive(ngAttributeAliasDirectives).directive(ngEventDirectives);
                $provide.provider({
                    $anchorScroll: $AnchorScrollProvider,
                    $animate: $AnimateProvider,
                    $browser: $BrowserProvider,
                    $cacheFactory: $CacheFactoryProvider,
                    $controller: $ControllerProvider,
                    //$document: $DocumentProvider,
                    $exceptionHandler: $ExceptionHandlerProvider,
                    $filter: $FilterProvider,
                    $interpolate: $InterpolateProvider,
                    $interval: $IntervalProvider,
                    $http: $HttpProvider,
                    $httpBackend: $HttpBackendProvider,
                    $location: $LocationProvider,
                    $log: $LogProvider,
                    $parse: $ParseProvider,
                    $rootScope: $RootScopeProvider,
                    $q: $QProvider,
                    $$q: $$QProvider,
                    $sce: $SceProvider,
                    $sceDelegate: $SceDelegateProvider,
                    $sniffer: $SnifferProvider,
                    $templateCache: $TemplateCacheProvider,
                    $templateRequest: $TemplateRequestProvider,
                    $$testability: $$TestabilityProvider,
                    $timeout: $TimeoutProvider,
                    $global: $WindowProvider,
                    $$rAF: $$RAFProvider,
                    $$asyncCallback: $$AsyncCallbackProvider,
                    //$$jqLite: $$jqLiteProvider
                });
            }
        ]);
    })();
})();
