var Block = function (words, parent) {
	this.parent = parent;

	if (!words || !words.length) {
		//this.words = [new Word([new Char(''), new Char('')], this)];
		this.words = [new Word([new Char('')], this)];
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

		this.words.splice(targetIndex, 0, word);

		word.checkForSpaces();
	},

	insertBefore: function (refWord, word) {
		if (!word) {
			return;
		}

		word.parent = this;

		var targetIndex = this.words.indexOf(refWord);
		this.words.splice(targetIndex, 0, word);

		word.checkForSpaces();
	},

	removeWordsAfter: function (refWord) {
		var targetIndex = this.words.indexOf(refWord);
		if (targetIndex === -1 || targetIndex === (this.words.length - 1)) {
			return [];
		}

		return this.words.splice(targetIndex + 1, this.words.length);
	},

	toString: function () {
		return this.words.join('');
	},

	toJSON: function (id) {
		var json = {
			id: 'b' + id,
			name: 'B',
			children: []
		};
		this.words.forEach(function (word, index) {
			json.children.push(word.toJSON(id + '-' + index));
		});
		return json;
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