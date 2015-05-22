var snakeCase = require('snake-case');
var camelCase = require('camelcase');

exports.capitalize = function(str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
};

exports.camel = camelCase;

exports.snake = snakeCase;

exports.train = function(str) {
  return snakeCase(str).replace(/_/g, '-');
};
