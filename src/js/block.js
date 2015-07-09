var Block = function (words, parent) {
	this.parent = parent;

	if (!words || !words.length) {
		this.words = [new Word('', this)];
	} else {
		this.words = words;
		this.words.forEach(function (word) {
			word.parent = this;
		}, this);
	}
}

Block.prototype = {
	type: 'p',

	getChars: function () {
		var chars = [];
		this.words.forEach(function (word, index) {
			chars = chars.concat(word.getChars());
			if (index !== (this.words.length - 1)) {
				chars.push(' ');
			}
		}, this);
		return chars;
	},

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

		// Inserting at the end means inserting before the ending
		// new-line terminator word (which would be -1 for splice)
		//
		// Coincidentally, indexOf() returns -1 if it can't find
		// the ref. So, we can just use targetIndex for splice()
		this.words.splice(targetIndex, 0, word);

		word.checkForSpaces();
	},

	insertBefore: function (refWord, word) {
		if (!word) {
			return;
		}

		word.parent = this;

		var targetIndex = this.word.indexOf(refWord);
		this.words.splice(targetIndex, 0, word);

		word.checkForSpaces();
	},

	toString: function () {
		return this.words.join('');
	},

	toDebugString: function () {
		var str = '<' + this.type + '>';
		if (!this.words.length) {
			str += '<br/>';
		} else {
			str += this.words.join(' ');
		}
		return str + '</' + this.type + '>';
	},

	toHTML: function () {
		var content = '';
		this.words.forEach(function (word, index) {
			content += word.toHTML();
			if (index !== (this.words.length - 1)) {
				content += ' ';
			}
		}, this);
		return '<' + this.type + '>' + content + '</' + this.type + '>';
	}
}