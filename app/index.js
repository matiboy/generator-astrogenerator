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

AstrogeneratorGenerator.prototype.askFor = function askFor() {
  var cb = this.async();
  var _ = this._;
  var footerChoices = require('./footers');
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
      return answers.serviceMethods;
    },
    when: function(answers) {
      return answers.useService && answers.serviceMethods.length > 0;
    }
  },
  {
    type: 'confirm',
    name: 'includeHeader',
    message: 'Include header?',
    default: true
  },
  {
    type: 'confirm',
    name: 'includeFooter',
    message: 'Include footer?',
    default: true
  },
  {
    type: 'text',
    name: 'routeTitle',
    message: 'Title displayed in header?',
    default: function(answers) { // Default to same as route name but capitalized
      return _s.capitalize(answers.routeName);
    },
    when: function(answers){ // Only ask this if header selected
      return answers.includeHeader;
    }
  }];
  var selectedButtons = [];
  function footerPrompt() {
    this.prompt([{
      type: 'list',
      name: 'footerButton',
      message: 'Add footer button (Select empty string to stop)',
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
  this.prompt(prompts, function (answers) {
    this.routeName = answers.routeName;
    this.routeTitle = answers.routeTitle;
    this.includeHeader = answers.includeHeader;
    this.includeFooter = answers.includeFooter;
    this.useService = answers.useService;
    // Get objects for methods instead of just name
    this.serviceMethods = _.filter(serviceMethods, function(meth) {
      return _.contains(answers.serviceMethods, meth.name);
    });
    // Caching?
    _.each(this.serviceMethods, function(item) {
      item.cache = _.contains(answers.serviceMethodsCaching, item.name);
    });
    if(this.includeFooter) {
      footerPrompt.bind(this)();
    } else {
      cb();
    }
    
  }.bind(this));
};

AstrogeneratorGenerator.prototype.addToRoutes = function addToRoutes() {
  this.controllerName = _s.capitalize(_s.camelize(this.routeName));
  var f = this.readFileAsString('app/scripts/app.js');
  // TODO Dirty, but what would be a better way?
  f = f.replace('.otherwise(', ".when('/"+this.routeName+"',{\ntemplateUrl: 'views/"+this.routeName+".html',\ncontroller:'"+this.controllerName+"Ctrl'"+(this.includeHeader ? ",\ntitle:'" + this.routeTitle + "'" : '')+'\n}).otherwise(');
  this.write('app/scripts/app.js', f);
}

AstrogeneratorGenerator.prototype.files = function files() {
  console.log(this.controllerName);
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
};

AstrogeneratorGenerator.prototype.addToIndex = function addToIndex() {
  // Add all the files we created to the index
  var indexFile = this.readFileAsString('app/index.html');
  // JS
  var out = this.appendScripts(indexFile, 'scripts/scripts.js', this.jsFiles);
  // CSS (not created yet, Grunt will take care of that)
  this.write('app/index.html', out);
}