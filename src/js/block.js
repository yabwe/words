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
		return this.words.reduce(function (prev, curr) {
			return prev.concat(curr.getChars());
		}, []);
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

		word.split();
	},

	insertBefore: function (refWord, word) {
		if (!word) {
			return;
		}

		word.parent = this;

		var targetIndex = this.words.indexOf(refWord);
		this.words.splice(targetIndex, 0, word);

		word.split();
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

	toHTML: function () {
		var content = '';
		this.words.forEach(function (word, index) {
			content += word.toHTML();
			if (index !== (this.words.length - 1)) {
				content += Util.Char.SPACE;
			}
		}, this);
		return '<' + this.type + '>' + content + '</' + this.type + '>';
	}
}