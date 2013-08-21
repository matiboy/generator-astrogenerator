'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var _s = require('underscore.string');
var AstrogeneratorGenerator = module.exports = function AstrogeneratorGenerator(args, options, config) {
  this.jsFiles = [];
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    // this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AstrogeneratorGenerator, yeoman.generators.Base);

AstrogeneratorGenerator.prototype.findAppName = function findAppName() {
  // have Yeoman greet the user.
  console.log(this.yeoman);

  var f = this.readFileAsString('./app/scripts/app.js');
  var reg = /angular.module\(\s*'([a-zA-Z]*)/;
    try {
      this.appName = reg.exec(f)[1];
      this.log.ok('Found app name: ' + this.appName);
    } catch(e) {
      this.log.skip('Could not read App name (will ask later)')
    }
  };

  AstrogeneratorGenerator.prototype.askForGeneralDetails = function askForGeneralDetails() {
    var cb = this.async();
    var _ = this._;
    var serviceMethods = require('./serviceMethods');
    var prompts = [
    {
      type: 'input',
      name: 'appName',
      message: "What is your app's name?",
      when: function() {
        return !this.appName;
      }.bind(this)
    },
    {
      type: 'input',
      name: 'routeName',
      message: 'What is the name of the route?'
    },
    {
      type: 'confirm',
      name: 'useService',
      message: 'Use corresponding service?',
      default: true
    },
    {
      type: 'checkbox',
      name: 'serviceMethods',
      message: 'Create common service methods',
      choices: serviceMethods,
      when: function(answers) {
        return answers.useService
      }
    },
    {
      type: 'checkbox',
      name: 'serviceMethodsCaching',
      message: 'Service methods using cache',
      choices: function(answers) {
        return answers.serviceMethods || [];
      },
      when: function(answers) {
        return answers.useService && answers.serviceMethods.length > 0;
      }
    }];
    this.prompt(prompts, function (answers) {
      this.routeName = answers.routeName;
      this.useService = answers.useService;
    // Get objects for methods instead of just name
    this.serviceMethods = _.filter(serviceMethods, function(meth) {
      return _.contains(answers.serviceMethods, meth.name);
    });
    // Caching?
    _.each(this.serviceMethods, function(item) {
      item.cache = _.contains(answers.serviceMethodsCaching, item.name);
    });
    cb();
  }.bind(this));
  };

  AstrogeneratorGenerator.prototype.askForHeader = function askForHeader() {
    var cb = this.async();
    var prompts = [
    {
      type: 'confirm',
      name: 'includeHeader',
      message: 'Include header?',
      default: true
    },{
      type: 'confirm',
      name: 'includeHeaderMenu',
      message: 'Include header menu?',
      default: true,
      when: function(answers){ // Only ask this if header selected
        return answers.includeHeader;
      }
    },
    {
      type: 'input',
      name: 'routeTitle',
      message: 'Header title',
      default: function(){
        return this._.str.capitalize(this.routeName);
      }.bind(this),
      when: function(answers){ // Only ask this if header selected
        return answers.includeHeader;
      }
    }
  ];
  this.prompt(prompts, function (answers) {
    this.includeHeader = answers.includeHeader;
    this.includeHeaderMenu = answers.includeHeaderMenu;
    this.routeTitle = answers.routeTitle;
    cb();
  }.bind(this));
};

AstrogeneratorGenerator.prototype.askForSubnav = function askForSubnav() {
  var cb = this.async();
  var subnavItems = [];
  this.subnavItems = [];
  function subnavPrompt() {
    this.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Add sub navigation item (<enter> to skip)'
    }
    ], function(answers){
      if(answers.title != '') {
        subnavItems.push(answers.title);
        subnavPrompt.bind(this)();
      } else {
        this.subnavItems = subnavItems;
        this.log.ok('Added ' + subnavItems.length + ' sub navigation items');
        cb();
      }
    }.bind(this))
  }

  var prompts = [
  {
    type: 'confirm',
    name: 'includeSubnav',
    message: 'Include sub navigation?',
    default: false
  }
  ];
  this.prompt(prompts, function (answers) {
    if(answers.includeSubnav) {
      subnavPrompt.bind(this)();
    } else {
      cb();
    }
  }.bind(this));
};

AstrogeneratorGenerator.prototype.askForFooter = function askForFooter() {
  var cb = this.async();
  var footerChoices = require('./footers');
  var selectedButtons = [];
  function footerPrompt() {
    this.prompt([{
      type: 'list',
      name: 'footerButton',
      message: 'Add footer button (select empty string to stop)',
      choices: footerChoices
    }], function(answers) {
      var button = answers.footerButton;
      if(button != '') {
        selectedButtons.push(button);
        footerChoices = this._.without(footerChoices, button);
        if(footerChoices.length > 1) {
          footerPrompt.bind(this)(); // Potential risk of stack overflow?
        } else {
          this.footerButtons = selectedButtons;
          cb();
        }
      } else {
        this.footerButtons = selectedButtons;
        cb();
      }
    }.bind(this));
  };
  var prompts = [
  {
    type: 'confirm',
    name: 'includeFooter',
    message: 'Include footer?',
    default: true
  }
  ];
  this.prompt(prompts, function (answers) {
    this.includeFooter = answers.includeFooter;
    if(this.includeFooter) {
      footerPrompt.bind(this)();
    } else {
      cb();
    }
  }.bind(this));
};

AstrogeneratorGenerator.prototype.addToRoutes = function addToRoutes() {
  this.controllerName = this._.str.capitalize(this._.str.camelize(this.routeName));
  var f = this.readFileAsString('app/scripts/app.js');
  // TODO Dirty, but what would be a better way?
  var newRouteInApp = ".when('/";
    newRouteInApp += this.routeName+"',{\ntemplateUrl: 'views/"+this.routeName+".html'";
    newRouteInApp += ",\ncontroller:'"+this.controllerName+"Ctrl'";
    newRouteInApp += ",\n"+(this.includeHeader ? "title:'" + this.routeTitle + "'" + (this.includeHeaderMenu ? "" : ",\nhideMenu: true") : "hideHeader: true");
    newRouteInApp += '\n}).otherwise(';
    f = f.replace('.otherwise(', newRouteInApp);
      this.write('app/scripts/app.js', f);
    }

    AstrogeneratorGenerator.prototype.files = function files() {
      this.template('_controller.js', 'app/scripts/controllers/' + this.routeName + '.js' );
      this.jsFiles.push('scripts/controllers/' + this.routeName + '.js');
      if(this.useService) {
        this.mkdir('app/scripts/services/');
        this.mkdir('app/scripts/modules/astro/');
        this.needsCache = this._.find(this.serviceMethods, function(meth) {
          return meth.cache;
        });
        console.log(this.needsCache);
        this.template('_service.js', 'app/scripts/services/' + this.controllerName + 'Service.js' );
        this.template('_astroService.js', 'app/scripts/modules/astro/' + this.controllerName + '.js' );
        this.jsFiles.push('scripts/services/' + this.controllerName + 'Service.js');
        this.jsFiles.push('scripts/modules/astro/' + this.controllerName + '.js');
      }
      this.divId = this._.str.dasherize(this.routeName);

  // Prepare nav stuff
  if(this.subnavItems.length > 0) {
    this.subnavClass = ['one', 'two', 'three', 'four', 'five', 'six'][this.subnavItems.length - 1];
  }
  
  if(this.includeFooter){
    this.footerClass = ['one', 'two', 'three', 'four', 'five', 'six'][this.footerButtons.length - 1];
  }

  this.template('_view.html', 'app/views/' +this.routeName+".html" );
  this.template('_route.sass', 'app/styles/_' + this.divId+".sass" );
};

AstrogeneratorGenerator.prototype.addToIndex = function addToIndex() {
  // Add all the files we created to the index
  var indexFile = this.readFileAsString('app/index.html');
  // JS
  var out = this.appendScripts(indexFile, 'scripts/scripts.js', this.jsFiles);
  // CSS (not created yet, Grunt will take care of that)
  this.write('app/index.html', out);
}