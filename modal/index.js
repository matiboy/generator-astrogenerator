'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var Paths = require('../paths');
var AstrogeneratorGenerator = module.exports = function AstrogeneratorGenerator(args, options, config) {
  this.jsFiles = [];
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
  this.showModal = 'show' + this.modalCamel;
  this.controller = this.modalCamel + 'ModalCtrl';
  this.serviceName = this.modalCamel + 'ModalService';
  var _modalTemplate = this._.template( this.readFileAsString(path.join(__dirname, './templates/_modal.html')) );
  this.write(Paths.PARTIALS + '/' + '_modals.html', _modals + _modalTemplate(this));
}

AstrogeneratorGenerator.prototype.createController = function createController() {
  this.modalStartSignal =  '// Start modal logic';
  try {
    this.readFileAsString(Paths.CONTROLLERS + '/modal.js');
    this.log.conflict('Modal controller exists, skipping');
  } catch(e) {
    this.log.skip('Modal controller does not exist, creating');
    this.template('_modalCtrl.js', Paths.CONTROLLERS + '/modal.js');
  }
}

AstrogeneratorGenerator.prototype.createModalLogic = function createModalLogic() {
  var modalController = this.readFileAsString(Paths.CONTROLLERS + '/modal.js');
  // add the service DI
  modalController = modalController.replace('$rootScope', '$rootScope, ' + this.serviceName);

  // Logic
  var logicTemplate = this._.template(this.readFileAsString(path.join(__dirname, './templates/_modalLogic.js')));
  this.write(Paths.CONTROLLERS + '/modal.js', modalController.replace(this.modalStartSignal, this.modalStartSignal + '\n' + logicTemplate(this)));
}


