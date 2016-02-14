// "coverage": "./node_modules/.bin/istanbul cover ./node_modules/mocha/bin/_mocha \"test/**/*.js\" -- --ui bdd -R spec"

var assert = require('chai').assert;
var expect = require('chai').expect;

var fs = require('fs');
var vm = require('vm');

var code = fs.readFileSync('./src/js/char.js');
vm.runInThisContext(code);

describe('Char', function () {
	describe('constructor', function () {
		it('should exist', function () {
			expect(Char).not.to.be.undefined;
		});

		it('should initialize core properties', function () {
			var char = new Char();

			expect(char.parent).to.be.undefined;
			expect(char.char).to.be.a('string');
			expect(char.char).to.be.empty;
			expect(char.props).to.be.a('object');
			expect(char.props).to.be.empty;
		});

		it('should aceept a character and a parent reference', function () {
			var tempParent = {},
				tempChar = 'X',
				char = new Char('X', tempParent);
			
			expect(char.char).to.equal(tempChar);
			expect(char.parent).to.equal(tempParent);
		});
	});
});