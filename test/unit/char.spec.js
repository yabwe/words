var expect = require('chai').expect;

var Char = require('../../src/js/char');

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

		it('should accept a character and a parent reference', function () {
			var tempParent = {},
				tempChar = 'X',
				char = new Char('X', tempParent);

			expect(char.char).to.equal(tempChar);
			expect(char.parent).to.equal(tempParent);
		});

		it('should accept props as an object', function () {
			var props = {
					'b': true,
					'i': false
				},
				char = new Char('X', null, props);

			expect(char.props).to.equal(props);
			expect(char.getProps()).to.deep.equal(['b']);
		});
	});

	describe('getProps', function () {
		it('should return properties as an array', function () {
			var char = new Char('a');

			char.props['PROP'] = true;
			char.props['B'] = true;

			var props = char.getProps();
			expect(props).to.be.an.instanceof(Array);
			expect(props.length).to.equal(2);
			expect(props[0]).to.equal('PROP');
			expect(props[1]).to.equal('B');
		});

		it('should return properties that have a value of true', function () {
			var char = new Char('a');

			char.props['B'] = 'B';
			char.props['I'] = true;
			char.props['U'] = null;
			char.props['P'] = false;

			var props = char.getProps();
			expect(props.length).to.equal(1);
			expect(props[0]).to.equal('I');
		});

		it('should return an empty array when nothing is true', function () {
			var char = new Char('a');

			expect(char.getProps()).to.be.empty;

			char['B'] = 'B';
			expect(char.getProps()).to.be.empty;
		});
	});

	describe('toJSON', function () {
		it('should return a JSON representaton of the char', function () {
			var char = new Char('a'),
				json = char.toJSON(1),
				output = {
					name: 'a',
					id: 'c1',
					children: []
				};

			expect(json).to.deep.equal(output);
		});

		it('should return JSON containing props as children', function () {
			var char = new Char('b');

			char.props['B'] = true;
			char.props['I'] = false;

			var output = {
				name: 'b',
				id: 'c2',
				children: ['B']
			};

			expect(char.toJSON(2)).to.deep.equal(output);
		});

		it('should return [ ] for spaces', function () {
			var char = new Char(' ');

			expect(char.toJSON('c')).to.deep.equal({
				name: '[ ]',
				id: 'cc',
				children: []
			});
		});

		it('should return \\n for new lines', function () {
			var char = new Char('\n');

			expect(char.toJSON('x')).to.deep.equal({
				name: '\\n',
				id: 'cx',
				children: []
			});
		});
	});

	describe('toString and toHTML', function () {
		it('should return the character', function () {
			var char = new Char('a'),
				str = char.toString(),
				html = char.toHTML();

			expect(str).to.be.a('string');
			expect(str).to.equal('a');
			expect(html).to.be.a('string');
			expect(html).to.equal('a');
		});

		it('should return empty string by default', function () {
			var char = new Char(),
				str = char.toString(),
				html = char.toHTML();

			expect(str).to.be.a('string');
			expect(str).to.be.empty;
			expect(html).to.be.a('string');
			expect(html).to.be.empty;
		});
	});
});