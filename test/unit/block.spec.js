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
				block = new Block(words, parent, 'h1');

			expect(block.words).to.equal(words);
			expect(words[0].parent).to.equal(block);
			expect(words[1].parent).to.equal(block);
			expect(block.parent).to.equal(parent);
			expect(block.type).to.equal('h1');
		});

		it('should initialize to a type P Block with an empty Word if not passed anything', function () {
			var block = new Block();

			expect(block.words.length).to.equal(1);
			expect(block.words[0].toString()).to.be.empty;
			expect(block.type).to.equal('p');
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

	describe('insertBefore', function () {
		it('should add Word before the provided Word', function () {
			var word = new Word('chars '),
				block = new Block([new Word('this '), new Word('is '), word]),
				toInsert = new Word('before ');

			expect(block.getWords().length).to.equal(3);

			block.insertBefore(word, toInsert);
			expect(block.getWords().length).to.equal(4);
			expect(toInsert.parent).to.equal(block);
			expect(block.toString()).to.equal('this is before chars ');
		});

		it('should add Word at the beginning of the Block if invalid reference is passed', function () {
			var block = new Block([new Word('chars\n')]),
				badRef = new Word('bad '),
				toInsert = new Word('before ');

			expect(block.toString()).to.equal('chars\n');

			block.insertBefore(badRef, toInsert);
			expect(toInsert.parent).to.equal(block);
			expect(block.toString()).to.equal('before chars\n');

			block.insertBefore(null, badRef);
			expect(badRef.parent).to.equal(block);
			expect(block.toString()).to.equal('bad before chars\n');
		});

		it('should do nothing if nothing is passed', function () {
			var block = new Block([new Word('nothing')]);

			block.insertBefore();
			expect(block.toString()).to.equal('nothing');
		});
	});

	describe('insertAfter', function () {
		it('should add a Word after the provided Word', function () {
			var word = new Word('this '),
				block = new Block([word, new Word('after '), new Word('chars\n')]),
				toInsert = new Word('is ');

			expect(block.getWords().length).to.equal(3);

			block.insertAfter(word, toInsert);
			expect(block.getWords().length).to.equal(4);
			expect(toInsert.parent).to.equal(block);
			expect(block.toString()).to.equal('this is after chars\n');
		});

		it('should add Word at the end of the Block if invalid reference is passed', function () {
			var block = new Block([new Word('way ')]),
				badRef = new Word('chars\n'),
				toInsert = new Word('after ');

			expect(block.toString()).to.equal('way ');

			block.insertAfter(badRef, toInsert);
			expect(toInsert.parent).to.equal(block);
			expect(block.toString()).to.equal('way after ');

			block.insertAfter(null, badRef);
			expect(badRef.parent).to.equal(block);
			expect(block.toString()).to.equal('way after chars\n');
		});

		it('should do nothing if nothing is passed', function () {
			var block = new Block([new Word('nothing')]);

			block.insertAfter();
			expect(block.toString()).to.equal('nothing');
		});
	});

	describe('insertWordsAfter', function () {
		it('should create a new Block to add to the parent after this Block', function () {
			var parent = {
					insertAfter: function (refBlock, newBlock) {
						this.refBlock = refBlock;
						this.newBlock = newBlock;
						newBlock.parent = this;
					}
				},
				block = new Block([new Word('previous '), new Word('block\n')], parent),
				newWords = [new Word('next '), new Word('block\n')],
				newBlock = block.insertWordsAfter(newWords);

			expect(newBlock.parent).to.equal(parent);
			expect(parent.refBlock).to.equal(block);
			expect(parent.newBlock).to.equal(newBlock);
			newWords.forEach(function (word) {
				expect(word.parent).to.equal(newBlock);
			});
		});
	});

	describe('splitAndInsertBlocks', function () {
		it('should create new Blocks out of the provided arrays of words, ' +
			'split this Block as the provided Word, and add the new Blocks after this Block', function () {
			var parent = {
					blocks: [],
					insertAfter: function (refBlock, newBlock) {
						var index = this.blocks.indexOf(refBlock);
						this.blocks.splice(index + 1, 0, newBlock);
						newBlock.parent = this;
					}
				},
				targetWord = new Word('end\n'),
				blockFirstWords = [new Word('block '), new Word('one '), targetWord],
				blockLastWords = [new Word('block '), new Word('three '), new Word('end\n')]
				wordArrays = [[new Word('block '), new Word('two\n')], [new Word('block '), new Word('three ')]],
				block = new Block(blockFirstWords.concat(blockLastWords), parent);

			parent.blocks.push(block);
			expect(parent.blocks.length).to.equal(1);
			expect(block.getWords().length).to.equal(6);
			expect(block.toString()).to.equal('block one end\nblock three end\n');
			blockFirstWords.forEach(function (word) {
				expect(word.parent).to.equal(block);
			});
			blockLastWords.forEach(function (word) {
				expect(word.parent).to.equal(block);
			});

			block.splitAndInsertBlocks(targetWord, wordArrays);
			expect(block.toString()).to.equal('block one end\n');
			expect(parent.blocks.length).to.equal(3);
			expect(parent.blocks[0]).to.equal(block);
			blockFirstWords.forEach(function (word) {
				expect(word.parent).to.equal(block);
			});

			var blockTwo = parent.blocks[1];
			expect(blockTwo.toString()).to.equal('block two\n');
			wordArrays[0].forEach(function (word) {
				expect(word.parent).to.equal(blockTwo);
			});

			var blockThree = parent.blocks[2];
			expect(blockThree.toString()).to.equal('block three block three end\n');
			wordArrays[1].forEach(function (word) {
				expect(word.parent).to.equal(blockThree);
			});
			blockLastWords.forEach(function (word) {
				expect(word.parent).to.equal(blockThree);
			});
		});
	});

	describe('merge', function () {
		it('should merge another Block into this Block', function () {
			var wordsOne = [new Word('one '), new Word('two ')],
				wordsTwo = [new Word('three '), new Word('four '), new Word('five\n')],
				parent = {
					removeBlock: sinon.spy()
				},
				blockOne = new Block(wordsOne, parent),
				blockTwo = new Block(wordsTwo, parent);

			blockOne.merge(blockTwo);
			expect(blockTwo.getWords()).to.be.empty;
			expect(parent.removeBlock).to.have.been.calledWith(blockTwo);
			expect(blockOne.parent).to.equal(parent);
			expect(blockOne.toString()).to.equal('one two three four five\n');
		});
	});

	describe('toJSON', function () {
		it('should return a JSON representation of the Block', function () {
			var chars = [new Char('c', null, { 'b': true }), new Char('h'), new Char('a'), new Char('r'), new Char('s'), new Char(' ')],
				words = [new Word('some '), new Word(chars)],
				block = new Block(words, {}, 'h2'),
				json = block.toJSON(0);

			expect(json).to.deep.equal({
				name: 'B',
				type: 'h2',
				id: 'b0',
				children: [
					{
						name: 'w',
						id: 'w0-0',
						children: [
							{ name: 's', id: 'c0-0-0', children: [] },
							{ name: 'o', id: 'c0-0-1', children: [] },
							{ name: 'm', id: 'c0-0-2', children: [] },
							{ name: 'e', id: 'c0-0-3', children: [] },
							{ name: '[ ]', id: 'c0-0-4', children: [] }
						]
					},
					{
						name: 'w',
						id: 'w0-1',
						children: [
							{ name: 'c', id: 'c0-1-0', children: ['b'] },
							{ name: 'h', id: 'c0-1-1', children: [] },
							{ name: 'a', id: 'c0-1-2', children: [] },
							{ name: 'r', id: 'c0-1-3', children: [] },
							{ name: 's', id: 'c0-1-4', children: [] },
							{ name: '[ ]', id: 'c0-1-5', children: [] }
						]
					}
				]
			});
		});

		it('should return a JSON representation when the Block is initilized with nothing', function () {
			var block = new Block(),
				json = block.toJSON(1);

			expect(json).to.deep.equal({
				name: 'B',
				type: 'p',
				id: 'b1',
				children: [
					{
						name: 'w',
						id: 'w1-0',
						children: [{ name: '', id: 'c1-0-0', children: [] }]
					}
				]
			})
		});

		it('should return a JSON representation when the Block is empty', function () {
			var block = new Block([], { removeBlock: function () {} }, 'blockquote');

			block.removeWord(block.getWords()[0]);
			var json = block.toJSON(2);

			expect(json).to.deep.equal({
				name: 'B',
				type: 'blockquote',
				id: 'b2',
				children: []
			});
		});
	});

	describe('toHTML', function () {
		it('should return the Block as a chunk of HTML wrapped in a block element tag', function () {
			var chars = [
					new Char('c', null, { 'b': true }),
					new Char('h', null, { 'i': true }),
					new Char('a'),
					new Char('r', null, { 'sup': true }),
					new Char('s', null, { 'sup': false, 'sub': true }),
					new Char('\n')
				],
				word = new Word(chars),
				words = [new Word('some '), word],
				block = new Block(words, {}, 'h3'),
				res = block.toHTML();

			expect(res).to.equal('<h3>some <b><i><sup><sub>chars</sub></sup></i></b></h3>');
		});

		it('should return the Words concatenated as a String if there is not any formatting', function () {
			var block = new Block([new Word('some '), new Word('chars\n')]),
				res = block.toHTML();

			expect(res).to.equal('<p>some chars</p>');
		});
	});
});


