#!/usr/bin/env node

var builder = require('./builder');

var templateData = {
  version: '0.10.0'
};

var fileList = [
  'form.js',
  'helpers.js',
  'validators.js',
  'field.js',
  'editors.js',
  'setup.js',
  'templates/default.js'
];

//Concatenate the main files
var mainContents = builder()
  .setDir(__dirname + '/../src')
  .concat(fileList)
  .getContent();

//Save regular dev and mini versions
builder()
  .setDir(__dirname + '/../')
  .setContent(mainContents)
  .wrap('scripts/build-templates/main.js', templateData)
  .save('distribution/test.js')
  .uglify()
  .save('distribution/test.min.js');


//Main AMD file (for RequireJS)
builder()
  .setDir(__dirname + '/../')
  .setContent(mainContents)
  .wrap('scripts/build-templates/main.amd.js', templateData)
  .save('distribution/test.amd.js')
  .uglify()
  .save('distribution/test.amd.min.js');
