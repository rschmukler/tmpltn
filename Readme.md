# tmpltn

Super lightweight in-directory project scaffolding

## Installation

```
npm -g install tmpltn
```

## Example Usage

```
tmpltn gen Model name=Person
```

`templates/model.tmpltn.js`
```js
/**
 * TmpltnName: Model
 * TmpltnDescription: Generic scaffolding for a Model
 */

// TmpltnOutput: lib/models/{{ train:name }}-model.js
class {{capitalize:camel:name}} {
}

// TmpltnOutput: test/models/{{ train:name }}-model-spec.js
var expect = require('expect.js');
describe('Models::{{capitalCamel:name}}', function() {
});
````

Creates files:

`lib/models/person-model.js`
```js
class Person {
}
```

`test/models/person-model-spec.js`
```js
var expect = require('expect.js');
describe('Models::Person', function() {
});
```
## Using Tmpltn

#### ls

Lists available templates

```
tmpltn ls
```

#### gen [opts] [name] [vars...]

Generates template of given `name` using the variables provided.

Omit `vars` to see available variables for a given file.

```
tmpltn gen Model
```
```
Possible variables: name
```

You may also overwrite the default output directory by specifying `--output-path`.

```
tmpltn gen --output-path customDir/ Model name="Bob"
```

## Template Files

The following tags are all valid:

- `TmpltnName` - the name of the template, used for `tmpltn ls`
- `TmpltnDescription` - the description for the template, used for `tmpltn ls`
- `TmpltnOutput` - the default output path for the file

## Variable Transfomation

The following transformers may be used. (Feel free to submit a PR to add more!)

Transformation may also be chained. eg. `{{ capitalize:camel:name }}`

- *camel* - `My Name` -> `myName`
- *capitalize* - `myName` -> `MyName`
- *snake* - `My Name` -> `my_name`
- *train* - `My Name` -> `my-name`
