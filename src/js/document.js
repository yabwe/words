var Document = function (text) {
	this.chars = [];
	this.blocks = [new Block(null, this)];
	this.chars = this.blocks.reduce(function (prev, curr) {
		return prev.concat(curr.getChars());
	}, []);
	this.tail = this.chars[0];

	if (text) {
		this.insertCharsAt(0, text);
	}
}

Document.prototype = {

	/* execAction(action, selection)
	 *
	 * Given an action (ie bold, italic) and a selection data object
	 * apply the action to all the chars/words within the selection
	 */
	execAction: function (action, selection) {
		var nextWord;
		// Since this.chars is an array, we can index directly into it to
		// find the CHAR nodes within the selection
		if (this.chars[selection.start]) {
			for (var i = selection.start; i < this.chars.length && i < selection.end; i++) {
				var next = this.chars[i];
				// For now, let's only apply actions on words.  This means just find the parent
				// of each char, and apply the action if we haven't already
				if (next.parent !== nextWord) {
					nextWord = next.parent;
					if (nextWord) {
						// Call toggleProp(), which should turn the property on/off for the whole word
						nextWord.toggleProp(action);
					}
				}
			}
		}
	},

	insertCharsAt: function (index, str) {
		if (!str) {
			return;
		}

		var newChars = [],
			nextChar = this.chars[index],
			nextWord,
			prevChar = this.chars[index - 1],
			prevWord;

		str.split('').forEach(function (part) {
			newChars.push(new Char(part));
		}, this);

		if (exists(nextChar)) {
			nextWord = nextChar.parent;
		}
		if (exists(prevChar)) {
			prevWord = prevChar.parent;
		}

		if (nextWord === prevWord || !prevWord) {
			nextWord.insertBefore(nextChar, newChars);
		} else {
			if (Util.isNewLine(prevChar.char) || Util.isSpace(prevChar.char)) {
				if (nextWord) {
					nextWord.insertBefore(null, newChars);
				} else {
					var newWord = new Word(newChars);
					prevWord.parent.insertAfter(prevWord, newWord);
				}
			} else {
				prevWord.insertAfter(prevChar, newChars);
			}
		}

		this.chars.splice.apply(this.chars, [index, 0].concat(newChars));
	},

	removeCharsAt: function (index, count) {
		if (!this.chars[index]) {
			return;
		}

		var removedChars = this.chars.splice(index, count);

		removedChars.forEach(function (char) {
			char.parent.removeChar(char);
		});
	},

	insertAfter: function (refBlock, block) {
		if (!block) {
			return;
		}

		block.parent = this;

		var targetIndex = this.blocks.indexOf(refBlock);
		if (targetIndex === -1) {
			targetIndex = this.blocks.length;
		} else {
			targetIndex += 1;
		}

		this.blocks.splice(targetIndex, 0, block);
	},

	toJSON: function () {
		var json = {
			id: 'doc',
			name: 'd',
			children: []
		}
		this.blocks.forEach(function (block, index) {
			json.children.push(block.toJSON(index));
		});
		return json;
	},

	toString: function () {
		return this.blocks.join('');
	},

	toHTML: function () {
		var str = '';
		this.blocks.forEach(function (block) {
			str += block.toHTML();
		}, this);
		return str;
	}
}