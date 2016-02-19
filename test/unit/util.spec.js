var expect = require('chai').expect;

var Util = require('../../src/js/util');

describe('Util', function () {
	describe('exists', function () {
		it('should return true for empty string false and 0', function () {
			expect(Util.exists('')).to.be.true;
			expect(Util.exists(false)).to.be.true;
			expect(Util.exists(0)).to.be.true;
		});

		it('should return false for null and undefined', function () {
			expect(Util.exists(undefined)).to.be.false;
			expect(Util.exists(null)).to.be.false;
		});

		it('should return false for a deleted property', function () {
			var obj = { prop: false };
			expect(Util.exists(obj.prop)).to.be.true;

			delete obj.prop;
			expect(Util.exists(obj.prop)).to.be.false;
		});
	});

	describe('isNewLine', function () {
		it('should return true for \\n', function () {
			expect(Util.isNewLine('\n')).to.be.true;
			expect(Util.isNewLine('\r')).to.be.false;
			expect(Util.isNewLine(' ')).to.be.false;
		});
	});

	describe('isSpace', function () {
		it('should return true for spaces', function () {
			var whiteSpaces = [' ', '\t', '\v', '\f', '\u00A0', '\u2000', '\u2001', '\u2002', '\u2003','\u2028', '\u2029'];

			whiteSpaces.forEach(function (str) {
				expect(Util.isSpace(str)).to.be.true;
			});
		});

		it('should return false for new line chars and empty strings', function () {
			expect(Util.isSpace('\n')).to.be.false;
			expect(Util.isSpace('')).to.be.false;
		});
	});
});