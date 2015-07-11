var Document = function (text) {
	this.chars = [];
	this.blocks = [new Block(null, this)];
	this.chars = this.blocks.reduce(function (prev, curr) {
		return prev.concat(curr.getChars());
	}, []);
	//this.head = this.chars[0];
	this.tail = this.chars[0];

	if (text) {
		this.insertCharsAt(0, text);
	}
}

Document.prototype = {
	execAction: function (action, selection) {
		var nextWord;
		if (this.chars[selection.start]) {
			for (var i = selection.start; i < this.chars.length && i < selection.end; i++) {
				var next = this.chars[i];
				if (next.parent !== nextWord) {
					nextWord = next.parent;
					if (nextWord) {
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