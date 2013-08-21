'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var _s = require('underscore.string');

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
  var footerChoices = require('./footers');
  var prompts = [
  {
    type: 'input',
    name: 'routeName',
    message: 'What is the name of the route?'
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
          footerPrompt.bind(this)();
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
    if(this.includeFooter) {
      footerPrompt.bind(this)();
    } else {
      cb();
    }
    
  }.bind(this));
};

AstrogeneratorGenerator.prototype.app = function app() {
  console.log(this.routeName);
  console.log(this.footerButtons);
  this.mkdir('app');
  this.mkdir('app/templates');

  this.copy('_package.json', 'package.json');
  this.copy('_bower.json', 'bower.json');
};

AstrogeneratorGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
};
