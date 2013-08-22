'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var Paths = require('../paths');
var AstrogeneratorGenerator = module.exports = function AstrogeneratorGenerator(args, options, config) {
  this.jsFiles = [];
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });
  // Package already exist, otherwise stop everything
  this.pkg = JSON.parse(this.readFileAsString(Paths.PACKAGE_JSON));
};

util.inherits(AstrogeneratorGenerator, yeoman.generators.Base);

AstrogeneratorGenerator.prototype.findAppName = function findAppName() {
  // have Yeoman greet the user.
  console.log(this.yeoman);

  var f = this.readFileAsString(Paths.APP_JS);
  var reg = /angular.module\(\s*'[a-zA-Z]*'\s*,\s*(\[[^\]]*\])/;
    try {
      this.appDependenciesAsString = reg.exec(f)[1];
      this.appDependencies = JSON.parse(this.appDependenciesAsString.replace(/'/g, '"'));
      this.log.ok('Found ' + this.appDependencies.length + ' existing dependencies');
    } catch(e) {
      this.log.skip('Could not read App dependencies, weird results may happen');
    }
  };

AstrogeneratorGenerator.prototype.askForModulesAndLibraries = function askForModulesAndLibraries() {
  var cb = this.async();
  var astroModules = require('./astroModules');
  var commonLibraries = require('../commonLibraries');
  var prompts = [
  {
    type: 'checkbox',
    name: 'astroModules',
    message: 'Use following Astro modules:',
    choices: astroModules
  },
  {
    type: 'checkbox',
    name: 'libraries',
    message: 'Use following libraries:',
    choices: commonLibraries
  }
  ];
  this.prompt(prompts, function(answers){
    this.libraries = answers.libraries;
    this.astroModules = answers.astroModules;
    cb();
  }.bind(this));
};

AstrogeneratorGenerator.prototype.installModules = function installModules() {
  var cb = this._.after(this.astroModules.length, this.async());
  var astroModules = require('./astroModules');
  this._.each(this.astroModules, function(mod) {
    var fullMod = this._.find(astroModules, function(item) {
      return item.value == mod;
    });
    var console = this.log;
    this.remote(fullMod.user, fullMod.repo, function(err, remote) {
      remote.directory('', Paths.ASTRO_MODULES + '/' + fullMod.value);
      console.ok('Astro module ' + fullMod.value + ' downloaded');
      cb();
    });
    this.jsFiles.push(Paths.ASTRO_MODULES + '/' + fullMod.value + '/' + fullMod.value + '.js');
  }.bind(this));
};

AstrogeneratorGenerator.prototype.addDependencies = function addDependencies() {
  var fullAppjs = this.readFileAsString(Paths.APP_JS);

  var dependencies = this.appDependencies;

  this._.each(this.astroModules, function(item){
    if(this._.contains(dependencies, item)) {
      this.log.skip(item + ' is already a dependency');
    } else {
      dependencies.push(item);
      this.log.ok('Adding ' + item + ' to list of dependencies');
    }
  }.bind(this));
  this.write(Paths.APP_JS, fullAppjs.replace(this.appDependenciesAsString, JSON.stringify(dependencies)));
}

AstrogeneratorGenerator.prototype.addLibraries = function addLibraries() {
  var bower = JSON.parse( this.readFileAsString(Paths.BOWER_JSON ) );

  var libraries = this._.keys(bower.dependencies);

  var commonLibraries = require('../commonLibraries');

  this._.each(this.libraries, function(item){
    if(this._.contains(libraries, item)) {
      this.log.skip(item + ' is already a dependency');
    } else {
      var lib = this._.find(commonLibraries, function(x){
        return x.value == item;
      });
      bower.dependencies[item] = lib.version;
      this.log.ok('Adding ' + lib.name + ' to list of dependencies');
      this.jsFiles.push(Paths.BOWER_COMPONENTS + item + '/' + item + '.js');
    }
  }.bind(this));
  this.write(Paths.BOWER_JSON, JSON.stringify(bower));
}

AstrogeneratorGenerator.prototype.addJSFilesToIndex = function addJSFilesToIndex() {
  //Add all the files we created to the index
  var indexFile = this.readFileAsString(Paths.INDEX_HTML);
  // JS
  console.log(this.jsFiles);
  var out = this.appendScripts(indexFile, 'scripts/scripts.js', this.jsFiles);
  // CSS (not created yet, Grunt will take care of that)
  this.write(Paths.INDEX_HTML, out);
}



// AstrogeneratorGenerator.prototype.askForHeader = function askForHeader() {
//   var cb = this.async();
//   var prompts = [
//   {
//     type: 'confirm',
//     name: 'includeHeader',
//     message: 'Include header?',
//     default: true
//   },{
//     type: 'confirm',
//     name: 'includeHeaderMenu',
//     message: 'Include header menu?',
//     default: true,
//     when: function(answers){ // Only ask this if header selected
//       return answers.includeHeader;
//     }
//   },
//   {
//     type: 'input',
//     name: 'routeTitle',
//     message: 'Header title',
//     default: function(){
//       return this._.str.capitalize(this.routeName);
//     }.bind(this),
//     when: function(answers){ // Only ask this if header selected
//       return answers.includeHeader;
//     }
//   }
//   ];
//   this.prompt(prompts, function (answers) {
//     this.includeHeader = answers.includeHeader;
//     this.includeHeaderMenu = answers.includeHeaderMenu;
//     this.routeTitle = answers.routeTitle;
//     cb();
//   }.bind(this));
// };

// AstrogeneratorGenerator.prototype.askForSubnav = function askForSubnav() {
//   var cb = this.async();
//   var subnavItems = [];
//   this.subnavItems = [];
//   function subnavPrompt() {
//     this.prompt([
//     {
//       type: 'input',
//       name: 'title',
//       message: 'Add sub navigation item (<enter> to skip)'
//     }
//     ], function(answers){
//       if(answers.title != '') {
//         subnavItems.push(answers.title);
//         subnavPrompt.bind(this)();
//       } else {
//         this.subnavItems = subnavItems;
//         this.log.ok('Added ' + subnavItems.length + ' sub navigation items');
//         cb();
//       }
//     }.bind(this))
//   }

//   var prompts = [
//   {
//     type: 'confirm',
//     name: 'includeSubnav',
//     message: 'Include sub navigation?',
//     default: false
//   }
//   ];
//   this.prompt(prompts, function (answers) {
//     if(answers.includeSubnav) {
//       subnavPrompt.bind(this)();
//     } else {
//       cb();
//     }
//   }.bind(this));
// };

// AstrogeneratorGenerator.prototype.askForFooter = function askForFooter() {
//   var cb = this.async();
//   var footerChoices = require('./footers');
//   var selectedButtons = [];
//   function footerPrompt() {
//     this.prompt([{
//       type: 'list',
//       name: 'footerButton',
//       message: 'Add footer button (select empty string to stop)',
//       choices: footerChoices
//     }], function(answers) {
//       var button = answers.footerButton;
//       if(button != '') {
//         selectedButtons.push(button);
//         footerChoices = this._.without(footerChoices, button);
//         if(footerChoices.length > 1) {
//         footerPrompt.bind(this)(); // Potential risk of stack overflow?
//       } else {
//         this.footerButtons = selectedButtons;
//         cb();
//       }
//     } else {
//       this.footerButtons = selectedButtons;
//       cb();
//     }
//   }.bind(this));
//   };
//   var prompts = [
//   {
//     type: 'confirm',
//     name: 'includeFooter',
//     message: 'Include footer?',
//     default: true
//   }
//   ];
//   this.prompt(prompts, function (answers) {
//     this.includeFooter = answers.includeFooter;
//     if(this.includeFooter) {
//       footerPrompt.bind(this)();
//     } else {
//       cb();
//     }
//   }.bind(this));
// };

// AstrogeneratorGenerator.prototype.addToRoutes = function addToRoutes() {
//   this.controllerName = this._.str.capitalize(this._.str.camelize(this.routeName));
//   var f = this.readFileAsString('app/scripts/app.js');
//   // TODO Dirty, but what would be a better way?
//   var newRouteInApp = ".when('/";
//   newRouteInApp += this.routeName+"',{\ntemplateUrl: 'views/"+this.routeName+".html'";
//   newRouteInApp += ",\ncontroller:'"+this.controllerName+"Ctrl'";
//   newRouteInApp += ",\n"+(this.includeHeader ? "title:'" + this.routeTitle + "'" + (this.includeHeaderMenu ? "" : ",\nhideMenu: true") : "hideHeader: true");
//   newRouteInApp += '\n}).otherwise(';
//   f = f.replace('.otherwise(', newRouteInApp);
//   this.write('app/scripts/app.js', f);
// }

// AstrogeneratorGenerator.prototype.files = function files() {
//   this.template('_controller.js', 'app/scripts/controllers/' + this.routeName + '.js' );
//   this.jsFiles.push('scripts/controllers/' + this.routeName + '.js');
//   if(this.useService) {
//     this.mkdir('app/scripts/services/');
//     this.mkdir('app/scripts/modules/astro/');
//     this.needsCache = this._.find(this.serviceMethods, function(meth) {
//       return meth.cache;
//     });
    
//     this.template('_service.js', 'app/scripts/services/' + this.controllerName + 'Service.js' );
//     this.template('_astroService.js', 'app/scripts/modules/astro/' + this.controllerName + '.js' );
//     this.jsFiles.push('scripts/services/' + this.controllerName + 'Service.js');
//     this.jsFiles.push('scripts/modules/astro/' + this.controllerName + '.js');
//   }
//   this.divId = this._.str.dasherize(this.routeName);

//   // Prepare nav stuff
//   if(this.subnavItems.length > 0) {
//     this.subnavClass = ['one', 'two', 'three', 'four', 'five', 'six'][this.subnavItems.length - 1];
//   }
  
//   if(this.includeFooter){
//     this.footerClass = ['one', 'two', 'three', 'four', 'five', 'six'][this.footerButtons.length - 1];
//   }

//   this.template('_view.html', 'app/views/' +this.routeName+".html" );
//   this.template('_route.sass', 'app/styles/_' + this.divId+".sass" );
// };

// AstrogeneratorGenerator.prototype.addToMainSass = function addToMainSass() {
//   var mainSassFile = this.readFileAsString('app/styles/main.sass');
//   this.write('app/styles/main.sass', '@import "'+this.divId+'"\n' + mainSassFile);
// }

// AstrogeneratorGenerator.prototype.addToIndex = function addToIndex() {
  
//   // Add all the files we created to the index
//   var indexFile = this.readFileAsString('app/index.html');
//   // JS
//   var out = this.appendScripts(indexFile, 'scripts/scripts.js', this.jsFiles);
//   // CSS (not created yet, Grunt will take care of that)
//   this.write('app/index.html', out);
// }
// AstrogeneratorGenerator.prototype.askAboutMenu = function askAboutMenu() {
//   var cheerio = require('cheerio');
//   var menu = this.readFileAsString('app/views/partials/_menu.html');
//   var $ = cheerio.load(menu);
//   var lis = $('li');
//   this.routeTitle = 'ddfdsdf';
//   var cb = this.async();
//   this.prompt([{
//     type: 'input',
//     name: 'menuPosition',
//     message: 'Menu position (0 to skip. 1 is the first position, ' +( lis.length + 1 )+ ' is the highest)',
//     default: 0,
//     validate: function(position) {
//       if(position>=0 && position<=lis.length+1) {
//         return true;
//       } else {
//         return 'Please enter a position between 0 and ' + (lis.length+1);
//       }
//     }
//   },
//   {
//     type: 'input',
//     name: 'menuTitle',
//     message: 'Menu title:',
//     default: this.routeTitle,
//     when: function(answers) {
//       return answers.menuPosition>0;
//     }
//   }
//   ], function(answers) {
//     this.menuTitle = answers.menuTitle;
//     this.menuPosition = answers.menuPosition;
//     cb();
//   }.bind(this));
// }

// AstrogeneratorGenerator.prototype.addToMenu = function addToMenu() {
//   if(this.menuPosition == 0) {
//     this.log.skip('Not adding to menu');
//   } else {
//     var cheerio = require('cheerio');
//     var menu = this.readFileAsString(Paths.MENU);
//     var $ = cheerio.load(menu);
//     var lis = $('li');
//     var newLi = '<li ng-click="menuClick()">' + this.menuTitle + '</li>';
//     if(this.menuPosition == 1) {
//       $(lis[0]).before(newLi);
//     } else {
//       $(lis[this.menuPosition-2]).after(newLi);
//     }
//     this.write(Paths.MENU, $.html());
//     this.log.ok('Menu item added');
//   }
  
// }