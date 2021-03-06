var Util = require('./util');
var Word = require('./word');
var Char = require('./char');

/*
 * A Block is an object which represents a chunk of text which is separated by other chunks of text by new lines.
 *
 * Block objects have 2 main properties:
 *
 * 1. words
 *    - Array of all the Word objects which are its children.
 * 2. parent
 *    - A reference to its parent Document object.
 */
var Block = function (words, parent, type) {
	this.parent = parent;

	if (!words || !words.length) {
		this.words = [new Word([new Char('')], this)];
	} else {
		this.words = words;
		this.words.forEach(function (word) {
			word.parent = this;
		}, this);
	}

	if (type) {
		this.type = type;
	}
}

Block.prototype = {
	type: 'p',

	/* merge(block)
	 *
	 * Merge the provided block into this block
	 */
	merge: function (block) {
		var first = true;
		while(block.getWords().length) {
			// Remove the word from the previous block and update its parent reference
			var nextWord = block.removeWord(block.getFirstWord());
			nextWord.parent = this;

			// If this is the first word we're merging in, we need to attempt to merge the words together.
			// If there's a space in there, word.merge() accounts for it
			if (first) {
				this.getLastWord().merge(nextWord);
				first = false;
			} else {
				this.words.push(nextWord);
			}
		}
	},

	/* insertAfter(refWord, word)
	 *
	 * Insert a single Word object into this list
	 * of words, after the provided reference Word (refWord)
	 *
	 * If refWord doesn't exist or isn't found, the word
	 * is added to the end
	 */
	insertAfter: function (refWord, word) {
		if (!word) {
			return;
		}

		word.parent = this;

		var targetIndex = this.words.indexOf(refWord);
		if (targetIndex === -1) {
			targetIndex = this.words.length;
		} else {
			targetIndex += 1;
		}

		this.words.splice(targetIndex, 0, word);

		word.split();
	},

	insertWordsAfter: function (words) {
		var newBlock = new Block(words);
		this.parent.insertAfter(this, newBlock);
		return newBlock;
	},

	/* insertBefore(refWord, word)
	 *
	 * Insert a single Word object into this list
	 * of words, before the provided reference Word (refWord)
	 *
	 * If refWord doesn't exist or isn't found, the word
	 * is added to the front
	 */
	insertBefore: function (refWord, word) {
		if (!word) {
			return;
		}

		word.parent = this;

		var targetIndex = this.words.indexOf(refWord);
		if (targetIndex === -1) {
			this.words.unshift(word);
		} else {
			this.words.splice(targetIndex, 0, word);
		}

		word.split();
	},

	/* removeWordsAfter(refWord)
	 *
	 * Remove all the words within this block that
	 * are after the provided reference Word (refWord)
	 *
	 * An array of the removed Word objects is returned
	 *
	 * The refWord is NOT removed
	 */
	removeWordsAfter: function (refWord) {
		var targetIndex = this.words.indexOf(refWord);
		if (targetIndex === -1 || targetIndex === (this.words.length - 1)) {
			return [];
		}

		var removed = this.words.splice(targetIndex + 1, this.words.length);
		removed.forEach(function (word) {
			delete word.parent;
		});

		return removed;
	},

	/* removeWord(word)
	 *
	 * Remove the specified Word object
	 * If this block is empty, it will remove
	 * itself from the Document
	 */
	removeWord: function (word) {
		var index = this.words.indexOf(word);
		if (index !== -1) {
			this.words.splice(index, 1);
			delete word.parent;
		}

		// If block is empty, remove it
		if (this.words.length === 0) {
			this.parent.removeBlock(this);
		}

		return word;
	},

	splitAndInsertBlocks: function (refWord, wordArrays) {
		// Since we're creating new blocks, we will need to move all
		// sibling words of this word into the final created block
		var siblingWords = this.removeWordsAfter(refWord),
			prevBlock = this;

		wordArrays.forEach(function (words) {
			prevBlock = prevBlock.insertWordsAfter(words);
		});
		// If we have sibling words, they need to added to the end
		// of the final created block
		siblingWords.forEach(function (word) {
			prevBlock.insertAfter(null, word);
		});
	},

	getWords: function () {
		return this.words;
	},

	getFirstWord: function () {
		return this.words[0];
	},

	getLastWord: function () {
		return this.words[this.words.length - 1];
	},

	getChars: function () {
		return this.words.reduce(function (prev, curr) {
			return prev.concat(curr.getChars());
		}, []);
	},

	toJSON: function (id) {
		var json = {
			id: 'b' + id,
			name: 'B',
			type: this.type,
			children: []
		};
		this.words.forEach(function (word, index) {
			json.children.push(word.toJSON(id + '-' + index));
		});
		return json;
	},

	toString: function () {
		return this.words.join('');
	},

	toHTML: function () {
		var content = '';
		this.words.forEach(function (word, index) {
			content += word.toHTML();
		}, this);
		return '<' + this.type + '>' + content + '</' + this.type + '>';
	}
}

module.exports = Block;