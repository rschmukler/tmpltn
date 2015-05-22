var snakeCase = require('snake-case');
var camelCase = require('camelcase');

exports.capitalCamel = function(str) {
  var camelStr = camelCase(str);
  return camelStr.slice(0, 1).toUpperCase() + camelStr.slice(1);
};

exports.camel = camelCase;

exports.snake = snakeCase;

exports.train = function(str) {
  return snakeCase(str).replace(/_/g, '-');
};
