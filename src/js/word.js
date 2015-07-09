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

	toggleProp: function (prop) {
		var setTrue = false;
		this.chars.forEach(function (next) {
			if (!next.props[prop]) {
				next.props[prop] = true;
				setTrue = true;
			}
		});

		if (!setTrue) {
			this.chars.forEach(function (next) {
				next.props[prop] = false;
			});
		}
	},

	checkForSpaces: function () {
		var currentChars = [],
			thisBlockWords = [],
			thisWordChars,
			newBlocks = [],
			nextBlock;

		this.chars.forEach(function (char) {
			currentChars.push(char);
			// We hit something which will end a word and could end a block
			if (char.char === ' ' || char.char === '\r\n' || char.char === '\n') {
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
				if (char.char !== ' ') {
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
		if (nextBlock && nextBlock.length) {
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
			newBlocks.forEach(function (words) {
				var block = new Block(words);
				prevBlock.parent.insertAfter(prevBlock, block);
				prevBlock = block;
			});
		}
	},

	insertAfter: function (refChar, chars) {
		if (!chars) {
			return;
		}

		chars.forEach(function (char) {
			char.parent = this;
		}, this);

		if (!refChar) {
			this.chars = this.chars.concat(chars);
		} else {
			var target = this.chars.indexOf(refChar);
			if (target === -1) {
				target = this.chars.length;
			} else {
				target = target + 1;
			}
			this.chars.splice.apply(this.chars, [target, 0].concat(chars));
		}

		this.checkForSpaces();
	},

	insertBefore: function (refChar, chars) {
		if (!chars) {
			return;
		}

		chars.forEach(function (char) {
			char.parent = this;
		}, this);

		if (!refChar) {
			this.chars = chars.concat(this.chars);
		} else {
			var target = this.chars.indexOf(refChar);
			if (target == -1) {
				target = 0;
			}
			this.chars.splice.apply(this.chars, [target, 0].concat(chars));
		}

		this.checkForSpaces();
	},

	removeChar: function (char) {
		var index = this.chars.indexOf(char);
		if (index !== -1) {
			this.chars.splice(index, 1);
		}
	},

	toString: function () {
		return this.chars.join('');
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

	toDebugString: function () {
		return this.chars.join('');
	},

	getChars: function () {
		return this.chars;
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