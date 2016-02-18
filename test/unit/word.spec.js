var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var expect = chai.expect;

var Word = require('../../src/js/word');
var Char = require('../../src/js/char');

describe('Word', function () {
	describe('constructor', function () {
		it('should exist', function () {
			expect(Word).not.to.be.undefined;
		});

		it('should accept an array of Char objects and set their parent reference', function () {
			var chars = [new Char('a'), new Char(' ')],
				word = new Word(chars);

			expect(word.chars).to.be.an.instanceof(Array);
			expect(word.chars).to.equal(chars);
			expect(word.chars[0].parent).to.equal(word);
			expect(word.chars[1].parent).to.equal(word);
		});

		it('should accept a string and convert it into Chars', function () {
			var str = 'chars ',
				word = new Word(str);

			expect(word.chars).to.be.an.instanceof(Array);
			expect(word.chars.length).to.equal(6);

			word.chars.forEach(function (char, idx) {
				expect(char).to.be.an.instanceof(Char);
				expect(char.toString()).to.equal(str[idx]);
				expect(char.parent).to.equal(word);
			});
		});

		it('should accept a parent reference', function () {
			var obj = {},
				word = new Word('a ', obj);

			expect(word.parent).to.equal(obj);
		});

		it('should create an empty Char when passed an empty string', function () {
			var str = '',
				word = new Word('');

			expect(word.chars.length).to.equal(1);
			expect(word.chars[0]).to.be.an.instanceof(Char);
			expect(word.chars[0].toString()).to.be.empty;
			expect(word.chars[0].parent).to.equal(word);
		});

		it('should have an empty char array by default', function () {
			var word = new Word();

			expect(word.chars).to.be.an.instanceof(Array);
			expect(word.chars.length).to.equal(0);
		});
	});

	describe('getChars', function () {
		it('should return the chars array', function () {
			var chars = [new Char('a'), new Char(' ')],
				word = new Word(chars);

			expect(word.getChars()).to.equal(chars);
		});
	});

	describe('getFirstChar', function () {
		it('should return the first Char', function () {
			var chars = [new Char('a'), new Char(' ')],
				word = new Word(chars);

			expect(word.getFirstChar()).to.equal(chars[0]);
		});
	});

	describe('getLastChar', function () {
		it('should return the last Char', function () {
			var chars = [new Char('a'), new Char(' ')],
				word = new Word(chars);

			expect(word.getLastChar()).to.equal(chars[1]);
		});
	});

	describe('removeChar', function () {
		it('should remove the provided Char and return it', function () {
			var word = new Word('chars '),
				target = word.getChars()[2];

			expect(word.getChars().length).to.equal(6);
			expect(target.parent).to.equal(word);

			var returned = word.removeChar(target);
			expect(returned).to.equal(target);
			expect(returned.parent).to.be.undefined;
			expect(word.getChars().length).to.equal(5);
			expect(word.toString()).to.equal('chrs ');
		});

		it('should not change anything if the provided Char is not the word', function () {
			var char = new Char('a'),
				word = new Word('chars '),
				returned = word.removeChar(char);

			expect(returned).to.equal(char);
			expect(word.toString()).to.equal('chars ');
		});

		it('should call removeWord on its parent if all Chars are removed', function () {
			var parent = {
					removeWord: sinon.spy()
				},
				word = new Word('a ', parent);

			expect(word.getChars().length).to.equal(2);

			var returned = word.removeChar(word.getChars()[0]);
			expect(returned.parent).to.be.undefined;
			expect(word.getChars().length).to.equal(1);
			expect(parent.removeWord).not.to.have.been.called;

			returned = word.removeChar(word.getChars()[0]);
			expect(returned.parent).to.be.undefined;
			expect(word.getChars().length).to.equal(0);
			expect(parent.removeWord).to.have.been.calledWith(word);
		});
	});

	describe('toJSON', function () {
		it('should return a JSON representation of the Word when initialized with a string', function () {
			var word = new Word('chars '),
				json = word.toJSON(0);

			expect(json).to.deep.equal({
				name: 'w',
				id: 'w0',
				children: [
					{ name: 'c', id: 'c0-0', children: [] },
					{ name: 'h', id: 'c0-1', children: [] },
					{ name: 'a', id: 'c0-2', children: [] },
					{ name: 'r', id: 'c0-3', children: [] },
					{ name: 's', id: 'c0-4', children: [] },
					{ name: '[ ]', id: 'c0-5', children: [] }
				]
			});
		});

		it('should return a JSON representation of the Word when initialized with an array of Chars', function () {
			var chars = [new Char('c', null, { 'b': true }), new Char('h'), new Char('a'), new Char('r'), new Char('s'), new Char(' ')],
				word = new Word(chars),
				json = word.toJSON(0);

			expect(json).to.deep.equal({
				name: 'w',
				id: 'w0',
				children: [
					{ name: 'c', id: 'c0-0', children: ['b'] },
					{ name: 'h', id: 'c0-1', children: [] },
					{ name: 'a', id: 'c0-2', children: [] },
					{ name: 'r', id: 'c0-3', children: [] },
					{ name: 's', id: 'c0-4', children: [] },
					{ name: '[ ]', id: 'c0-5', children: [] }
				]
			});
		});

		it('should return a JSON representation when the Word is empty', function () {
			var word = new Word(undefined),
				json = word.toJSON(1);

			expect(json).to.deep.equal({
				name: 'w',
				id: 'w1',
				children: []
			});
		});

		it('should return a JSON representation when the Word is just an empty string', function () {
			var word = new Word(''),
				json = word.toJSON(0);

			expect(json).to.deep.equal({
				name: 'w',
				id: 'w0',
				children: [{ name: '', id: 'c0-0', children: [] }]
			});
		});
	});

	describe('toString', function () {
		it('should return the characters converted into a string', function () {
			var str = 'chars ',
				word = new Word(str),
				res = word.toString();

			expect(word.getChars()[0]).to.be.an.instanceof(Char);
			expect(res).to.be.a('string');
			expect(res).to.equal(str);
		});
	});

	describe('toHTML', function () {
		it('should return the characters converted into a string', function () {
			var str = 'chars ',
				word = new Word(str),
				res = word.toHTML();

			expect(word.getChars()[0]).to.be.an.instanceof(Char);
			expect(res).to.be.a('string');
			expect(res).to.equal(str);
		});

		it('should return the characters converted into a string wrapped in tags based on props of Chars', function () {
			var chars = [
					new Char('c', null, { 'b': true }),
					new Char('h', null, { 'i': true }),
					new Char('a'),
					new Char('r', null, { 'sup': true }),
					new Char('s', null, { 'sup': false, 'sub': true }),
					new Char(' ')
				],
				word = new Word(chars),
				res = word.toHTML();

			expect(res).to.be.a('string');
			expect(res).to.equal('<b><i><sup><sub>chars </sub></sup></i></b>');
		});
	});

	describe('toggleProp', function () {
		it('should turn on a prop for all child Chars', function () {
			var word = new Word('chars ');

			word.getChars().forEach(function (char) {
				expect(char.props).to.deep.equal({});
			});

			word.toggleProp('b');
			word.getChars().forEach(function (char) {
				expect(char.props).to.deep.equal({ 'b': true });
			});
		});

		it('should set prop to true for all child Chars if only some are true already', function () {
			var chars = [
					new Char('c', null, { 'b': true }),
					new Char('h', null, { 'b': true }),
					new Char('a'),
					new Char('r', null, { 'b': true }),
					new Char('s', null, { 'b': true }),
					new Char(' ')
				],
				word = new Word(chars);

			word.toggleProp('b');
			word.getChars().forEach(function (char) {
				expect(char.props['b']).to.be.true;
			});
		});

		it('should set prop to false if all child Chars are already true', function () {
			var chars = [
					new Char('c', null, { 'b': true }),
					new Char('h', null, { 'b': true }),
					new Char('a', null, { 'b': true }),
					new Char('r', null, { 'b': true }),
					new Char('s', null, { 'b': true }),
					new Char(' ', null, { 'b': true })
				],
				word = new Word(chars);

				word.toggleProp('b');
				word.getChars().forEach(function (char) {
					expect(char.props['b']).to.be.false;
				});
		});
	});

	describe('split', function () {
		it('should split a Word containing a space into 2 Words', function () {
			var parent = {
					otherWord: null,
					refWord: null,
					insertAfter: function (refWord, otherWord) {
						this.refWord = refWord;
						this.otherWord = otherWord;
					}
				},
				word = new Word('chars morechars ', parent);

			expect(word.parent).to.equal(parent);
			word.split();
			expect(word.toString()).to.equal('chars ');
			expect(parent.refWord).to.equal(word);
			expect(parent.otherWord).not.to.be.null;
			expect(parent.otherWord.toString()).to.equal('morechars ');
		});

		it('should split a Word into multiple words if there are multiple space before the end of the Word', function () {
			var parent = {
					otherWords: [],
					insertAfter: function (refWord, otherWord) {
						this.otherWords.push(otherWord);
						otherWord.parent = this;
					}
				},
				word = new Word('c h a r s ', parent);

			expect(word.parent).to.equal(parent);
			word.split();
			expect(word.toString()).to.equal('c ');
			expect(parent.otherWords.length).to.equal(4);
			expect(parent.otherWords[0].toString()).to.equal('h ');
			expect(parent.otherWords[1].toString()).to.equal('a ');
			expect(parent.otherWords[2].toString()).to.equal('r ');
			expect(parent.otherWords[3].toString()).to.equal('s ');
		});

		it('should not do anything if the Word does not contain a space or newline before the end of the Word', function () {
			var parent = {
					otherWord: null,
					refWord: null,
					insertAfter: function (refWord, otherWord) {
						this.refWord = refWord;
						this.otherWord = otherWord;
					}
				},
				word = new Word('chars ', parent);

			expect(word.parent).to.equal(parent);
			word.split();
			expect(word.toString()).to.equal('chars ');
			expect(parent.refWord).to.be.null;
			expect(parent.otherWord).to.be.null;
		});

		// TODO: Should test splitting word that contains newlines
		// However, the code should be refactored to not make multiple calls
		// to different methods on parent object, so refactor and then make tests
	});

	describe('merge', function () {
		it('should merge Chars from another Word into this Word', function () {
			var parent = {
					removeWord: sinon.spy()
				},
				word = new Word('cha', parent),
				otherWord = new Word('rs ', parent);

			expect(word.parent).to.equal(parent);
			expect(otherWord.parent).to.equal(parent);

			word.merge(otherWord);
			expect(word.toString()).to.equal('chars ');
			expect(word.parent).to.equal(parent);
			word.getChars().forEach(function (char) {
				expect(char.parent).to.equal(word);
			});
			expect(parent.removeWord).to.have.been.calledWith(otherWord);
			expect(otherWord.getChars().length).to.equal(0);
		});

		it('should merge and then split words if needed', function () {
			var parent = {
					otherWords: [],
					insertAfter: function (refWord, otherWord) {
						this.otherWords.push(otherWord);
						otherWord.parent = this;
					},
					removeWord: sinon.spy()
				},
				word = new Word('chars one ', parent),
				splitSpy = sinon.spy(word, 'split'),
				otherWord = new Word('chars word ', parent);

			word.merge(otherWord);
			expect(splitSpy).to.have.been.called;
			expect(word.toString()).to.equal('chars ');
			expect(otherWord.getChars()).to.be.empty;
			expect(parent.otherWords.length).to.equal(3);
			expect(parent.otherWords[0].toString()).to.equal('one ');
			expect(parent.otherWords[1].toString()).to.equal('chars ');
			expect(parent.otherWords[2].toString()).to.equal('word ');
		});

		it('should call merge on its parent if the other Word is not paret of the same parent', function () {
			var parent = {
					merge: sinon.spy()
				},
				word = new Word('cha', parent),
				parentTwo = {},
				wordTwo = new Word('rs ', parentTwo);

			expect(word.parent).to.equal(parent);
			expect(wordTwo.parent).to.equal(parentTwo);

			word.merge(wordTwo);
			expect(parent.merge).to.have.been.calledWith(parentTwo);
		});
	});

	describe('insertBefore', function () {
		it('should add Chars before the provided char', function () {
			var word = new Word('chs '),
				chars = [new Char('a'), new Char('r')],
				letterS = word.getChars()[2];

			expect(word.getChars().length).to.equal(4);

			word.insertBefore(letterS, chars);
			chars.forEach(function (char) {
				expect(char.parent).to.equal(word);
			});
			expect(word.toString()).to.equal('chars ');
		});

		it('should add Chars at the beginning of the Word if invalid reference is passed', function () {
			var word = new Word('ars '),
				letterH = new Char('h'),
				letterC = new Char('c');

			expect(word.toString()).to.equal('ars ');

			word.insertBefore(letterC, [letterH]);
			expect(letterH.parent).to.equal(word);
			expect(word.toString()).to.equal('hars ');

			word.insertBefore(null, [letterC]);
			expect(letterC.parent).to.equal(word);
			expect(word.toString()).to.equal('chars ');
		});

		it('should do nothing if nothing is passed', function () {
			var word = new Word('chars ');

			word.insertBefore();
			expect(word.toString()).to.equal('chars ');
		});
	});

	describe('insertAfter', function () {
		it('should add Chars after the provided char', function () {
			var word = new Word('chs '),
				chars = [new Char('a'), new Char('r')],
				letterH = word.getChars()[1];

			expect(word.getChars().length).to.equal(4);

			word.insertAfter(letterH, chars);
			chars.forEach(function (char) {
				expect(char.parent).to.equal(word);
			});
			expect(word.toString()).to.equal('chars ');
		});

		it('should add Chars at the end of the Word if invalid reference is passed', function () {
			var word = new Word('char'),
				letterS = new Char('s'),
				letterSpace = new Char(' ');

			expect(word.toString()).to.equal('char');

			word.insertAfter(letterSpace, [letterS]);
			expect(letterS.parent).to.equal(word);
			expect(word.toString()).to.equal('chars');

			word.insertAfter(null, [letterSpace]);
			expect(letterSpace.parent).to.equal(word);
			expect(word.toString()).to.equal('chars ');
		});

		it('should do nothing if nothing is passed', function () {
			var word = new Word('chars ');

			word.insertAfter();
			expect(word.toString()).to.equal('chars ');
		});
	});
});