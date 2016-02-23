var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var expect = chai.expect;

var Block = require('../../src/js/block');
var Word = require('../../src/js/word');
var Char = require('../../src/js/char');

describe('Block', function () {
	describe('constructor', function () {
		it('should exist', function () {
			expect(Block).not.to.be.undefined;
		});

		it('should accept an array of Word objects and a parent reference', function () {
			var parent = {},
				words = [new Word('one '), new Word('two')],
				block = new Block(words, parent);

			expect(block.words).to.equal(words);
			expect(words[0].parent).to.equal(block);
			expect(words[1].parent).to.equal(block);
			expect(block.parent).to.equal(parent);
		});

		it('should initialize to an empty Word if not passed anything', function () {
			var block = new Block();

			expect(block.words.length).to.equal(1);
			expect(block.words[0].toString()).to.be.empty;
		});
	});

	describe('getWords', function () {
		it('should return the words array', function () {
			var words = [new Word('one '), new Word('two')],
				block = new Block(words);

			expect(block.getWords()).to.equal(words);
		});
	});

	describe('getFirstWord', function () {
		it('should return the first Word', function () {
			var words = [new Word('one '), new Word('two')],
				block = new Block(words);

			expect(block.getFirstWord()).to.equal(words[0]);
		});
	});

	describe('getLastWord', function () {
		it('should return the last Word', function () {
			var words = [new Word('one '), new Word('two')],
				block = new Block(words);

			expect(block.getLastWord()).to.equal(words[1]);
		});
	});

	describe('getChars', function () {
		it('should return all the Char objects that make up the Block', function () {
			var charsOne = [new Char('c', null, { 'b': true }), new Char('h'), new Char('a'), new Char('r'), new Char('s'), new Char(' ')],
				charsTwo = [new Char('m'), new Char('o'), new Char('r'), new Char('e'), new Char('!'), new Char('\n')],
				words = [new Word(charsOne), new Word(charsTwo)],
				block = new Block(words),
				combined = charsOne.concat(charsTwo);

			expect(block.getChars()).to.deep.equal(combined);
		});
	});

	describe('toString', function () {
		it('should return the characters converted into a string', function () {
			var strs = ['these ', 'are ', 'some ', 'chars\n'],
				words = strs.map(function (str) {
					return new Word(str);
				}),
				block = new Block(words),
				res = block.toString();

			expect(block.getWords().length).to.equal(4);
			expect(res).to.be.a('string');
			expect(res).to.equal(strs.join(''));
		});
	});

	describe('removeWord', function () {
		it('should remove the provided Word and return it', function () {
			var block = new Block([new Word('one '), new Word('two '), new Word('three '), new Word('four '), new Word('five\n')]),
				target = block.getWords()[2];

			expect(block.getWords().length).to.equal(5);
			expect(target.parent).to.equal(block);

			var returned = block.removeWord(target);
			expect(returned).to.equal(target);
			expect(returned.parent).to.be.undefined;
			expect(block.getWords().length).to.equal(4);
			expect(block.toString()).to.equal('one two four five\n');
		});

		it('should not change anything if the provided Word is not the Block', function () {
			var word = new Word('word'),
				block = new Block([new Word('other')]),
				returned = block.removeWord(word);

			expect(returned).to.equal(word);
			expect(block.toString()).to.equal('other');
		});

		it('should call removeBlock on its parent if all Words are removed', function () {
			var parent = {
					removeBlock: sinon.spy()
				},
				block = new Block([new Word('one '), new Word('two\n')], parent);

			expect(block.getWords().length).to.equal(2);

			var returned = block.removeWord(block.getWords()[0]);
			expect(returned.parent).to.be.undefined;
			expect(block.getWords().length).to.equal(1);
			expect(parent.removeBlock).not.to.have.been.called;

			returned = block.removeWord(block.getWords()[0]);
			expect(returned.parent).to.be.undefined;
			expect(block.getWords().length).to.equal(0);
			expect(parent.removeBlock).to.have.been.calledWith(block);
		});
	});

	describe('removeWordsAfter', function () {
		it('should remove the Words after the provided Word', function () {
			var wordFour = new Word('four '),
				wordFive = new Word('five\n'),
				words = [new Word('one '), new Word('two '), new Word('three '), wordFour, wordFive],
				block = new Block(words),
				target = words[2];

			expect(block.getWords().length).to.equal(5);
			expect(target.parent).to.equal(block);

			var removed = block.removeWordsAfter(target);
			expect(removed.length).to.equal(2);
			expect(removed[0]).to.equal(wordFour);
			expect(removed[0].parent).to.be.undefined;
			expect(removed[1]).to.equal(wordFive);
			expect(removed[1].parent).to.be.undefined;

			expect(block.getWords().length).to.equal(3);
			expect(block.toString()).to.equal('one two three ');
		});

		it('should not change anything if the provided Word is not the Block', function () {
			var block = new Block([new Word('one '), new Word('two '), new Word('three\n')]),
				word = new Word('four '),
				removed = block.removeWordsAfter(word);

			expect(removed).to.be.empty;
			expect(block.toString()).to.equal('one two three\n');
		});
	});
});


