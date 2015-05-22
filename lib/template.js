var fs = require('fs');
var path = require('path');

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


function getValue(name, contents) {
  var regex = new RegExp(name + ': (.*)(\n|$)');
  console.log(regex);
  console.log(contents);
  var match = contents.match(regex);
  if (match) {
    return match[1].trim();
  } else {
    return '';
  }
}

module.exports = Template;
