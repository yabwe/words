/*
 * A Word is an object which represents a chunk of text which is separated by other chunks of text by spaces (within the same **Block**).  All words will contain their ending character, which will either be:
 *    - A Space (' ')
 *    - A Newline ('\n')
 *    - An Empty String ('')
 *       - The last word in the **Document** will have this empty string as a terminator
 *
 * Word objects have 2 main properties:
 *
 * 1. chars
 *    - Array of all the Char objects which are its children.
 * 2. parent
 *    - A reference to its parent Block object.
 */
var Word = function (text, parent) {
	this.parent = parent;

	if (!text && text !== '') {
		this.chars = [];
	} else if (typeof text === 'string') {
		this.chars = [];
		var chars = (text) ? Array.prototype.slice.call(text) : [''];
		chars.forEach(function (char) {
			this.chars.push(new Char(char, this));
		}, this);
	} else {
		this.chars = text;
		this.chars.forEach(function (char) {
			char.parent = this;
		}, this);
	}
}

Word.prototype = {

	/* toggleProp(prop)
	 *
	 * Given some property name (ie bold, italic), toggle its value for
	 * all of the chars within this word
	 *
	 */
	toggleProp: function (prop) {
		var setTrue = false;
		/* Loop through each char
		 * If a char has a false value for the property, set it to true
		 *
		 * ie: If half a word is bold, make the whole word bold
		 */
		this.chars.forEach(function (char) {
			if (!char.props[prop]) {
				char.props[prop] = true;
				setTrue = true;
			}
		});

		/* If the entire word already had the property set to true
		 * loop back through and turn the property off.
		 *
		 * ie: If an entire word is already bold, make it all unbold
		 */
		if (!setTrue) {
			this.chars.forEach(function (char) {
				char.props[prop] = false;
			});
		}
	},

	/* split()
	 *
	 * Look for spaces and newlines within this word
	 * Each space means create a new words
	 * Each newline means create a new block
	 */
	split: function () {
		var currentChars = [],
			thisBlockWords = [],
			thisWordChars,
			newBlocks = [],
			nextBlock;

		this.chars.forEach(function (char, index, array) {
			currentChars.push(char);
			if (index === array.length - 1) {
				return;
			}
			// We hit something which will end a word and could end a block
			if (Util.isNewLine(char.char) || Util.isSpace(char.char)) {
				// If we aren't adding to a newWord, that means we're still in the original
				if (!thisWordChars) {
					thisWordChars = currentChars;
				} else {
					// Add the newChars to a new word
					if (!nextBlock) {
						thisBlockWords.push(new Word(currentChars));
					} else {
						nextBlock.push(new Word(currentChars));
					}
				}
				currentChars = [];

				// If we hit a newline, we need to start a new block
				if (Util.isNewLine(char.char)) {
					if (nextBlock) {
						newBlocks.push(nextBlock);
					}
					nextBlock = [];
				}
			}
		}, this);

		// If we never hit a space, do nothing
		if (!thisWordChars) {
			return;
		}

		// Update our list of chars
		this.chars = thisWordChars;

		// If we have any lingering chars, make sure they get added into a word or block
		if (currentChars.length) {
			if (!nextBlock) {
				thisBlockWords.push(new Word(currentChars));
			} else {
				nextBlock.push(new Word(currentChars));
			}
		}

		// If we have any lingering blocks, make sure they get added into the blocks list
		if (nextBlock) {
			newBlocks.push(nextBlock);
		}

		// First, let's add any new words to this block
		if (thisBlockWords.length) {
			var prevWord = this;
			thisBlockWords.forEach(function (word) {
				prevWord.parent.insertAfter(prevWord, word);
				prevWord = word;
			});
		}

		// Now, let's start creating blocks
		if (newBlocks.length) {
			var prevBlock = this.parent;
			// Since we're creating new blocks, we will need to move all
			// sibling words of this word into the final created block
			var siblingWords = this.parent.removeWordsAfter(this);
			newBlocks.forEach(function (words) {
				var block = new Block(words);
				prevBlock.parent.insertAfter(prevBlock, block);
				prevBlock = block;
			});
			// If we have sibling words, they need to added to the end
			// of the final created blocked
			siblingWords.forEach(function (word) {
				prevBlock.insertAfter(null, word);
			});
		}
	},

	/* insertAfter(refChar, char)
	 *
	 * Insert an array of Char objects into this word
	 * all after the provided reference char (refChar)
	 *
	 * If refChar doesn't exist or isn't found, all the chars
	 * are added to the end
	 */
	insertAfter: function (refChar, chars) {
		if (!chars) {
			return;
		}

		chars.forEach(function (char) {
			char.parent = this;
		}, this);

		var targetIndex = this.chars.indexOf(refChar);
		if (targetIndex === -1) {
			this.chars = this.chars.concat(chars);
		} else {
			targetIndex = targetIndex + 1;
			this.chars.splice.apply(this.chars, [targetIndex, 0].concat(chars));
		}

		this.split();
	},

	/* insertBefore(refChar, char)
	 *
	 * Insert an array of Char objects into this word
	 * all before the provided reference char (refChar)
	 *
	 * If refChar doesn't exist or isn't found, all the chars
	 * are inserted at the beginning of the word
	 */
	insertBefore: function (refChar, chars) {
		if (!chars) {
			return;
		}

		chars.forEach(function (char) {
			char.parent = this;
		}, this);

		var targetIndex = this.chars.indexOf(refChar);
		if (targetIndex === -1) {
			this.chars = chars.concat(this.chars);
		} else {
			this.chars.splice.apply(this.chars, [targetIndex, 0].concat(chars));
		}

		this.split();
	},

	/* removeChar(char)
	 *
	 * Remove the provided Char object from the list
	 * of chars in this word
	 */
	removeChar: function (char) {
		var index = this.chars.indexOf(char);
		if (index !== -1) {
			this.chars.splice(index, 1);
		}
	},

	getChars: function () {
		return this.chars;
	},

	toJSON: function (id) {
		var json = {
			id: 'w' + id,
			name: 'w',
			children: []
		};
		this.chars.forEach(function (char, index) {
			json.children.push(char.toJSON(id + '-' + index));
		});
		return json;
	},

	toString: function () {
		return this.chars.join('');
	},

	toHTML: function () {
		var tags = {},
			pre = '',
			post = '',
			content = '';
		this.chars.forEach(function (next) {
			next.getProps().forEach(function (prop) {
				tags[prop] = true;
			});
			content += next.toHTML();
		}, this);
		Object.keys(tags).forEach(function (tag) {
			pre = '<' + tag + '>' + pre;
			post = post + '</' + tag + '>';
		});
		return pre + content + post;
	}
}