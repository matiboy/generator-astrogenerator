'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var AstrogeneratorGenerator = module.exports = function AstrogeneratorGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    // this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AstrogeneratorGenerator, yeoman.generators.Base);

AstrogeneratorGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(this.yeoman);

  var prompts = [
  {
    type: 'text',
    name: 'routeName',
    message: 'What is the name of the route?'
  }];
  this.prompt(prompts, function (props) {
    this.routeName = props.routeName;
    cb();
  }.bind(this));
  cb = this.async();
  prompts = [
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
  }];
  this.prompt(prompts, function (props) {
    this.includeHeader = props.includeHeader;
    this.includeFooter = props.includeFooter;
    cb();
  }.bind(this));
  cb = this.async();
  prompts = [];
  if(this.includeHeader) {
    prompts.push({
      type: 'text',
      name: 'routeTitle',
      message: 'Title displayed in header?',
      default: this.routeName
    })
  }
  if(this.includeFooter) {
    var buttons = require('./footers');
    prompts.push({
      type: 'checkbox',
      name: 'footers',
      message: 'Footer buttons:',
      choices: buttons.footers
    })
  }
  if(prompts.length) {
    this.prompt(prompts, function (props) {
      this.routeTitle = props.routeTitle;
      this.footers = props.footers;
      console.log(this.footers);
      cb();
    }.bind(this));
  } else {
    cb();
  }
};

AstrogeneratorGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/templates');

  this.copy('_package.json', 'package.json');
  this.copy('_bower.json', 'bower.json');
};

AstrogeneratorGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
};
