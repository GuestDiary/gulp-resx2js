var through2 = require('through2');
var xmldoc = require('xmldoc');
var gutil = require('gulp-util');
var rext = require('replace-ext');
var PluginError = gutil.PluginError;

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
		var content, children, childNode, outputObj = {}, namespace = options.namespace || '';
    	files.forEach(function(file) {
			content = file.contents.toString('utf8');
			var document = new xmldoc.XmlDocument(content);
			children = document.childrenNamed('data');
			for(childNode in children) {
				outputObj[children[childNode].attr.name] = children[childNode].children[0].val;
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