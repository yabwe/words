var chai = require('chai');
var expect = chai.expect;

var Document = require('../../src/js/document');
var Block = require('../../src/js/block');
var Word = require('../../src/js/word');

describe('Document', function () {
	describe('constructor', function () {
		it('should exist', function () {
			expect(Document).not.to.be.undefined;
		});

		it('should initialize with an empty Block and a single empty Char by default', function () {
			var doc = new Document();

			expect(doc.blocks.length).to.equal(1);
			expect(doc.blocks[0].toString()).to.be.empty;

			expect(doc.chars.length).to.equal(1);
			expect(doc.chars[0].toString()).to.be.empty;

			expect(doc.tail).to.equal(doc.chars[0]);
			expect(doc.tail.toString()).to.be.empty;
		});

		it('should initialize Blocks, Words, and Chars when passed a string', function () {
			var doc = new Document('block one\nblock two\nblock three');

			expect(doc.blocks.length).to.equal(3);
			expect(doc.blocks[0].getWords().length).to.equal(2);
			expect(doc.blocks[1].getWords().length).to.equal(2);
			expect(doc.blocks[2].getWords().length).to.equal(2);

			expect(doc.chars.length).to.equal(32);
			expect(doc.chars.join('')).to.equal('block one\nblock two\nblock three');
		});
	});

	describe('toString', function () {
		it('should return the Char values concatenated together', function () {
			var doc = new Document('block one\nblock two\nblock three');

			expect(doc.toString()).to.equal('block one\nblock two\nblock three');
		});
	});

	describe('removeBlock', function () {
		it('should remove th specified Block', function () {
			var doc = new Document('block one\nblock two\nblock three');
			expect(doc.blocks.length).to.equal(3);

			doc.removeBlock(doc.blocks[1]);
			expect(doc.blocks.length).to.equal(2);
			expect(doc.toString()).to.equal('block one\nblock three');
		});

		it('should do nothing if passed a Block not contained in the Document', function () {
			var doc = new Document('block one\nblock two\nblock three'),
				block = new Block([new Word('block '), new Word('two\n')], doc);
			expect(doc.blocks.length).to.equal(3);

			doc.removeBlock(block);
			expect(doc.blocks.length).to.equal(3);
			expect(doc.toString()).to.equal('block one\nblock two\nblock three');
		});
	});

	describe('insertAfter', function () {
		it('should insert a Block after the referenced Block', function () {
			var doc = new Document('block one\nblock three'),
				block = new Block([new Word('block '), new Word('two\n')]);
			expect(doc.blocks.length).to.equal(2);

			doc.insertAfter(doc.blocks[0], block);
			expect(doc.blocks.length).to.equal(3);
			expect(block.parent).to.equal(doc);
			expect(doc.toString()).to.equal('block one\nblock two\nblock three');
		});

		it('should insert a Block at the end if the reference Block is invalid', function () {
			var doc = new Document('block one'),
				blockOne = new Block([new Word('block '), new Word('two\n')]),
				blockTwo = new Block([new Word('block '), new Word('three')]);
			expect(doc.blocks.length).to.equal(1);

			doc.insertAfter(blockTwo, blockOne);
			expect(doc.blocks.length).to.equal(2);
			expect(doc.blocks[1]).to.equal(blockOne);
			expect(blockOne.parent).to.equal(doc);
			expect(doc.toString()).to.equal('block oneblock two\n');

			doc.insertAfter(null, blockTwo);
			expect(doc.blocks.length).to.equal(3);
			expect(doc.blocks[2]).to.equal(blockTwo);
			expect(blockTwo.parent).to.equal(doc);
			expect(doc.toString()).to.equal('block oneblock two\nblock three');
		});

		it('should not do anything if no Block is passed', function () {
			var doc = new Document('block one\nblock two\nblock three');
			expect(doc.blocks.length).to.equal(3);

			doc.insertAfter(doc.blocks[0], null);
			expect(doc.blocks.length).to.equal(3);
			expect(doc.toString()).to.equal('block one\nblock two\nblock three');
		});
	});

	describe('removeCharsAt', function () {
		it('should remove a number of Chars starting at the specified index and return them', function () {
			var doc = new Document('block one\nblock two\nblock three');
			expect(doc.blocks.length).to.equal(3);

			var removed = doc.removeCharsAt(1, 5);
			removed.forEach(function (char) {
				expect(char.parent).to.be.undefined;
			});
			expect(removed.join('')).to.equal('lock ');
			expect(doc.toString()).to.equal('bone\nblock two\nblock three');
			expect(doc.blocks.length).to.equal(3);
		});

		it('should remove a number of Chars and merge Blocks and Words', function () {
			var doc = new Document('block one\nblock two\nblock three');
			expect(doc.blocks.length).to.equal(3);
			doc.blocks.forEach(function (block) {
				expect(block.getWords().length).to.equal(2);
			});

			var removed = doc.removeCharsAt(1, 10);
			removed.forEach(function (char) {
				expect(char.parent).to.be.undefined;
			});
			expect(removed.join('')).to.equal('lock one\nb');
			expect(doc.toString()).to.equal('block two\nblock three');
			expect(doc.blocks.length).to.equal(2);
			doc.blocks.forEach(function (block) {
				expect(block.getWords().length).to.equal(2);
				expect(block.getWords()[0].getChars().length).to.equal(6);
				expect(block.getWords()[0].toString()).to.equal('block ');
			});
		});

		it('should not do anything if the specified index is invalid', function () {
			var doc = new Document('block one\nblock two\nblock three');
			expect(doc.blocks.length).to.equal(3);
			expect(doc.toString()).to.equal('block one\nblock two\nblock three');

			var removed = doc.removeCharsAt(40, 5);
			expect(removed).to.be.empty;
			expect(doc.blocks.length).to.equal(3);
			expect(doc.toString()).to.equal('block one\nblock two\nblock three');
		});
	});
});

