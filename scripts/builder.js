/*
Example usage:

builder()
  .setDir('/src')
  .load('base.js')
  .concat(['editors.js', 'field.js'])
  .wrap('../builders/template.js', { version: '0.9' })
  .save('../distribution/output.js')
  .uglify()
  .save('../distribution/output.min.js');
*/

var fs = require('fs'),
    _ = require('underscore'),
    uglifyJS = require('uglify-js');

/**
 * @param {Object} options
 * @param {String} [options.dir]         Base directory file operations start in.
 * @param {Object} [options.interpolate] Underscore template settings. Default to mustache {{var}} style interpolation tags.
 * @param {String} [options.encoding]    File encoding ('utf-8')
 * @param {String} [options.eol]         End of line character ('\n')
 * @param {Boolean} [options.quiet]      Whether to silence console output
 */
function Builder(options) {
  this.options = _.extend({
    encoding: 'utf-8',
    eol: '\n',
    interpolate: /\{\{(.+?)\}\}/g
  }, options);

  _.templateSettings.interpolate = this.options.interpolate;

  //The current directory
  this.dir = this.options.dir || __dirname;

  //The content being acted on
  this.content = '';
};

/**
 * Set the current working directory
 *
 * @param {String} path     Absolute directory path
 */
Builder.prototype.setDir = function(path) {
  this.dir = path;

  return this;
};

/**
 * Change the directory, relateive to the current working directory
 *
 * @param {String} path     Directory path, relative to the current directory
 */
Builder.prototype.changeDir = function(path) {
  this.dir = this.dir + '/' + path;

  return this;
};

/**
 * Set the content to work with
 * 
 * @param {String} content
 */
Builder.prototype.setContent = function(content) {
  this.content = content;

  return this;
};

/**
 * Returns the content. Note: this method breaks the chain
 * 
 * @return {String}
 */
Builder.prototype.getContent = function() {
  return this.content;
}

/**
 * Load file contents
 *
 * @param {String} path     File path relative to current directory
 */
Builder.prototype.load = function(path) {
  path = this.dir + '/' + path;

  this.content = fs.readFileSync(path, this.options.encoding);

  return this;
};

/**
 * Concatenate file contents
 * 
 * @param {String|String[]} paths   File path(s) relative to current directory
 * @param {String} [eol]            Join character. Default: '\n'
 */
Builder.prototype.concat = function(paths, eol) {
  eol = eol || this.options.eol;

  if (!_.isArray(paths)) paths = [paths];

  var dir = this.dir,
      encoding = this.options.encoding;

  var contents = paths.map(function(path) {
    path = dir + '/' + path;

    return fs.readFileSync(path, encoding);
  });

  this.content = contents.join(eol);

  return this;
};

/**
 * Wrap the contents in a template
 *
 * @param {String} template       Template file path, relative to current directory. Should have a {{body}} tag where content will go.
 * @param {Object} [templateData] Data to pass to template
 */
Builder.prototype.wrap = function(templatePath, templateData) {
  templatePath = this.dir + '/' + templatePath;
  templateData = templateData || {};

  var data = _.extend(templateData, {
    body: this.content
  });

  var templateStr = fs.readFileSync(templatePath, this.options.encoding);

  this.content = _.template(templateStr, data);

  return this;
};


/**
 * Uglifies the content
 */
Builder.prototype.uglify = function() {
  var parse = uglifyJS.parser.parse,
      uglify = uglifyJS.uglify;

  var output = parse(this.content);

  output = uglify.ast_mangle(output);
  output = uglify.ast_squeeze(output);
  output = uglify.gen_code(output);
  
  this.content = output;

  return this;
};

/**
 * Save the contents to disk
 *
 * @param {String} path         File path relative to current directory
 */
Builder.prototype.save = function(path) {
  path = this.dir + '/' + path;

  //Create the directory if necessary
  //TODO: Use recursive mkdir-p lib
  try {
    fs.mkdirSync(path);
  } catch (e) {}

  fs.writeFileSync(path, this.content);

  if (!this.options.quiet) console.log('Wrote: ' + path);

  return this;
};

/**
 * Reset the contents
 */
Builder.prototype.reset = function() {
  this.content = '';

  return this;
};


/**
 * Factory method which creates a new builder
 *
 * @param {Object} [options]    Constructor options
 */
module.exports = function(options) {
  return new Builder(options);
};
