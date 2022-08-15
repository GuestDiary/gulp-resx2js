var through2 = require('through2');
var xmldoc = require('xmldoc');
var rext = require('replace-ext');
var PluginError = require('plugin-error');

const PLUGIN_NAME = 'gulp-resx2js';

function resx2JS(options) {
	files = [];
	options = options || {};
	outputFile = null;

	var stream = through2.obj(function(file, enc, callback) {
		if (file.isNull()) {
			this.push(file);
			return callback();
		}
		if (file.isStream()) {
			throw new PluginError(PLUGIN_NAME, "Streaming is not supported");
		}
		outputFile = outputFile || file;
		files.push(file);
	    return callback();
    }, function(callback) {
		var outputObj = {}, namespace = options.namespace || '';
    	files.forEach(function(file) {
			var content = file.contents.toString('utf8');
			var children = new xmldoc.XmlDocument(content).childrenNamed('data');
			for(var childNode in children) {
				var valueNode = children[childNode].children.find(function(child) { return child.name === 'value'; })
				outputObj[children[childNode].attr.name] = valueNode.val;
			}
    	});
		var resourceJson = JSON.stringify(outputObj);
		outputFile.path = outputFile.base + (options.target || rext(outputFile.path, '.js'));
		outputFile.contents = new Buffer(namespace == '' ? resourceJson : "{ \"" + namespace + "\": " + resourceJson + "}");
		this.push(outputFile);
		var outputLog = ('Resource file generated: ' + outputFile.base + (options.target || rext(outputFile.path, '.js'))).replace('/', '\\');
		console.log(outputLog);
		return callback();
	});

	return stream;
}

module.exports = resx2JS;