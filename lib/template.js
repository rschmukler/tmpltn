var fs = require('fs');
var path = require('path');

var transformers = require('./transformers');

const varRegex = /\{\{\s*(\w+:)*(\w+)\s*\}\}/g;

function Template(filePath) {
  this.path = filePath;
  this.shortPath = filePath.split(path.sep).slice(-2).join(path.sep);
}

Template.prototype.open = function(cb) {
  var self = this;
  fs.readFile(path.resolve(this.path), 'utf8', function(err, contents) {
    if (err) return cb(err);
    self.contents = contents;
    self.description = getValue('TmpltnDescription', contents);
    self.name = getValue('TmpltnName', contents);
    cb();
  });
};

Template.prototype.getVars = function() {
  var vars = this.contents.match(varRegex);
  var uniqueVars = {};
  vars.forEach(function(exp) {
    exp = exp.replace(/\{:\}/g, '').split(':');
    if (exp.length == 1) {
      uniqueVars[exp[0].trim()] = true;
    } else {
      uniqueVars[exp[exp.length - 1].trim()] = true;
    }
  });
  return Object.keys(uniqueVars);
};

Template.prototype.generate = function(varMap, outputTo, cb) {
  if (!cb) {
    cb = outputTo;
    outputTo = undefined;
  }

  var contents = this.contents.replace(varRegex, function(match) {
    var exp = match.replace(/\{|\}/g, '').split(':');
    var varName = exp.pop().trim();
    var value = varMap[varName] || varName;

    while (exp.length) {
      var transformerName = exp.pop().trim();
      var transformer = transformers[transformerName];
      if (!transformer) {
        var error = new Error('Invalid transformer: ' + transformerName);
        error.type = 'TemplateError';
        return cb(error);
      } else {
        value = transformer(value);
      }
    }

    return value;
  });
  console.log(contents);
};

function getValue(name, contents) {
  var regex = new RegExp(name + ': (.*)(\n|$)');
  var match = contents.match(regex);
  if (match) {
    return match[1].trim();
  } else {
    return '';
  }
}

module.exports = Template;
