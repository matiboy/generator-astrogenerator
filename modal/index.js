'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var Paths = require('../paths');
var AstrogeneratorGenerator = module.exports = function AstrogeneratorGenerator(args, options, config) {
  this.jsFiles = [];
  this.affectedFiles = [];
  yeoman.generators.Base.apply(this, arguments);
  console.log(this.yeoman);

  var f = this.readFileAsString(Paths.APP_JS);
  var reg = /angular.module\(\s*'([a-zA-Z]*)/;
  try {
    this.appName = reg.exec(f)[1];
    this.log.ok('Found app name: ' + this.appName);
  } catch(e) {
    this.log.skip('Could not read App name (will ask later)')
  }
};

util.inherits(AstrogeneratorGenerator, yeoman.generators.Base);

AstrogeneratorGenerator.prototype.askDetails = function askDetails() {
  var cb = this.async();
  this.prompt({
    type: 'input',
    message: 'Title of your modal?',
    name: 'modalName'
  }, function(answer){
    this.modalName = answer.modalName;
    cb();
  }.bind(this));
}

AstrogeneratorGenerator.prototype.addDivToPartial = function addToMenu() {
  var _modals = this.readFileAsString(Paths.PARTIALS + '/' + '_modals.html');
  this.modalId = this._.str.slugify(this.modalName) + '-modal';
  this.modalCamel = this._.camelize(this.modalName);
  this.modalClose = 'close' + this.modalCamel;
  this.showModal = 'show' + this.modalCamel;
  this.controller = this.modalCamel + 'ModalCtrl';
  this.serviceName = this.modalCamel + 'ModalService';
  var _modalTemplate = this._.template( this.readFileAsString(path.join(__dirname, './templates/_modal.html')) );
  this.affectedFiles.push(Paths.PARTIALS + '/_modals.html');
  this.write(Paths.PARTIALS + '/_modals.html', _modals + _modalTemplate(this));
}

AstrogeneratorGenerator.prototype.createController = function createController() {
  this.modalStartSignal =  '// Start modal logic';
  try {
    this.readFileAsString(Paths.CONTROLLERS + '/modal.js');
    this.log.conflict('Modal controller exists, skipping');
  } catch(e) {
    this.log.skip('Modal controller does not exist, creating');
    this.template('_modalCtrl.js', Paths.CONTROLLERS + '/modal.js');
    this.jsFiles.push(Paths.CONTROLLERS + '/modal.js');
    this.affectedFiles.push(Paths.CONTROLLERS + '/modal.js');
  }
}
AstrogeneratorGenerator.prototype.createService = function createService() {
  try {
    this.readFileAsString(Paths.SERVICES + '/ModalService.js');
    this.log.conflict('Modal service exists, skipping');
  } catch(e) {
    this.log.skip('Modal service does not exist, creating');
    this.template('_modalService.js', Paths.SERVICES + '/ModalService.js');
    this.jsFiles.push(Paths.SERVICES + '/ModalService.js');
    this.affectedFiles.push(Paths.SERVICES + '/ModalService.js');
  }
}

AstrogeneratorGenerator.prototype.createModalController = function createModalController() {
  this.template('_controller.js', Paths.CONTROLLERS + '/' + this.modalCamel + '.js');
  this.affectedFiles.push(Paths.CONTROLLERS + '/' + this.modalCamel + '.js');
  this.jsFiles.push(Paths.CONTROLLERS + '/' + this.modalCamel + '.js');
}

AstrogeneratorGenerator.prototype.addFilesToIndex = function addFilesToIndex() {
  // Add all the files we created to the index
  var indexFile = this.readFileAsString(Paths.INDEX_HTML);
  // JS
  var out = this.appendScripts(indexFile, 'scripts/scripts.js', this.jsFiles);
  // CSS (not created yet, Grunt will take care of that)
  this.write(Paths.INDEX_HTML, out);
  this.affectedFiles.push(Paths.INDEX_HTML);
}

AstrogeneratorGenerator.prototype.informAboutTodos = function informAboutTodos() {
  var todos = [];
  this._.each(this.affectedFiles, function(f) {
    var lines = this.readFileAsString(f).split('\n');
    this._.each(lines, function(line, i) {
      if(line.indexOf('// TODO') != -1) {
        todos.push('Line ' + (i+1) + ' of file ' + f + ': ' + (line.replace( '// TODO ', '')) );
      }
    }.bind(this))
  }.bind(this));
  if(todos.length > 0) {
    this.log.info('You probably need to do something about the following TODOs: ');
    this._.each(todos, function(todo){
      this.log.info(todo);
    }.bind(this))
  }
}



