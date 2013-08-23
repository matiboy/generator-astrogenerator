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
  var bower;
  try {
    bower = JSON.parse( this.readFileAsString(Paths.BOWER_JSON ) );
  } catch(e) {
    // TODO check the exception
    this.log.skip('Could not find bower.json, checking whether you are using component.json');
    try{
      bower = JSON.parse( this.readFileAsString(Paths.COMPONENT_JSON ) );
    } catch(e){
      this.log.skip('Unable to find component.json. Will create a new bower.json file');
      bower = {
        dependencies: {}
      };
    }
    
  }

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
      this.jsFiles.push(Paths.BOWER_COMPONENTS + '/' + item + '/' + item + '.js');
    }
  }.bind(this));
  this.write(Paths.BOWER_JSON, JSON.stringify(bower, null, 4));
}

AstrogeneratorGenerator.prototype.addJSFilesToIndex = function addJSFilesToIndex() {
  //Add all the files we created to the index
  var indexFile = this.readFileAsString(Paths.INDEX_HTML);
  // JS
  var out = this.appendScripts(indexFile, 'scripts/scripts.js', this.jsFiles);
  // CSS (not created yet, Grunt will take care of that)
  this.write(Paths.INDEX_HTML, out);
}

AstrogeneratorGenerator.prototype.createFoldersAndFiles = function createFoldersAndFiles() {
  this.mkdir(Paths.PARTIALS);
  this.copy('_menu.html', Paths.PARTIALS + '/_menu.html');
  this.copy('_modals.html', Paths.PARTIALS + '/_modals.html');
}