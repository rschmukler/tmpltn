var fs = require('fs');
var path = require('path');

var Batch = require('batch');
var mkdirp = require('mkdirp');
var chalk = require('chalk');

var transformers = require('./transformers');

const varRegex = /\{\{\s*(\w+:)*\s*(\w+)\s*\}\}/g;

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
    exp = exp.replace(/\{|\}/g, '').split(':');
    uniqueVars[exp[exp.length - 1].trim()] = true;
  });
  return Object.keys(uniqueVars);
};

Template.prototype.generate = function(varMap, outputTo, cb) {
  if (!cb) {
    cb = outputTo;
    outputTo = undefined;
  }

  // Convert expressions to values
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

  // Parse out the various files in the content
  var files = {};
  var lines = contents.split('\n');
  var currentFileName;
  var startIndex = 0;
  lines.forEach(function(line, i) {
    if (/TmpltnOutput/.test(line)) {
      if (startIndex) splitToFile(i);
      currentFileName = getValue('TmpltnOutput', line);
      startIndex = i + 1;
    }
  });
  splitToFile();

  // Write the files
  var writes = new Batch();
  Object.keys(files).forEach(function(f) {
    var parts = f.split(path.sep);
    var fileName = parts.slice(-1)[0];
    var filePath = outputTo || parts.slice(0, -1).join(path.sep);

    var destPath = path.resolve(filePath, fileName);
    writes.push(function(done) {
      mkdirp(filePath, function(err) {
        if (err) return done(err);
        fs.writeFile(destPath, files[f], function(err) {
          if (err) return done(err);
          console.log("[" + chalk.green("Created") + "] - " + path.relative(process.cwd(), destPath));
          done();
        });
      });
    });
  });

  writes.end(cb);

  function splitToFile(index) {
    files[currentFileName] = lines.slice(startIndex, index).join('\n');
  }
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
