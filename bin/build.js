var path = require('path');
var fs = require('fs');

var browserify = require('browserify');

var fileName = process.env.npm_package_name + '.js';
var srcDir = './src/js';
var distDir = './dist';

var files = [path.join(srcDir, fileName)];

if (!fs.existsSync(distDir)){
    fs.mkdirSync(distDir);
}

var b = browserify(files);

b.bundle().pipe(fs.createWriteStream(path.join(distDir, fileName)));