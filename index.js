var through2 = require('through2');
var xmldoc = require('xmldoc');
var gutil = require('gulp-util');
var rext = require('replace-ext');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-resx2js';

function resx2JS(options) {
	options = options || {};

	var stream = through2.obj(function(file, enc, callback) {
		var content, document, children, childNode, outputObj = {};

		var namespace = options.namespace || '';

		if (file.isNull()) {
			this.push(file);
			return callback();
		}

		if (file.isStream()) {
			throw new PluginError(PLUGIN_NAME, "Streaming is not supported");
		}

		content =  file.contents.toString('utf8');
		document = new xmldoc.XmlDocument(content);

		children = document.childrenNamed('data');

		for(childNode in children) {
			outputObj[children[childNode].attr.name] = children[childNode].children[0].val;
		}

		file.path = file.base + (options.target || rext(file.path, '.js'));
		console.log('Resource file generated: ' + file.base + (options.target || rext(file.path, '.js')));


		var resourceJson = JSON.stringify(outputObj);
		file.contents = new Buffer(namespace == '' ? resourceJson : "{ \"" + namespace + "\": {" + resourceJson + "}}");

		this.push(file);
		return callback();
	});

	return stream;
}

module.exports = resx2JS;