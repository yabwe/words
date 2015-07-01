var Util = {

	blockNames: ['address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'noscript', 'ol', 'p', 'pre',

	'article', 'aside', 'audio', 'canvas', 'dd', 'figcaption', 'figure', 'footer', 'hgroup', 'main', 'nav', 'output', 'section', 'table', 'tfoot', 'ul', 'video',

	'dt', 'li', 'tbody', 'td', 'th', 'thead', 'tr'],

	on: function (target, event, listener, useCapture) {
        target.addEventListener(event, listener, useCapture);
    }
}


var Document = function (root) {
	this.chars = [];
	if (!root) {
		this.blocks = [new Block(null, this)];
	} else {
		this.blocks = [];
		Array.prototype.slice.call(root.childNodes).forEach(function (element) {
			var block = new Block(element, this);
			this.chars = this.chars.concat(block.getChars());
			this.blocks.push(block);
		}, this);
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

	toString: function () {
		return this.blocks.join('\r\n');
	},

	toHTML: function () {
		var str = '';
		this.blocks.forEach(function (block) {
			str += block.toHTML();
		}, this);
		return str;
	}
}



var Block = function (root, parent) {
	this.parent = parent;

	this.words = [];
	if (!root) {
		return;
	}

	var skipRoot = false;
	if (Util.blockNames.indexOf(root.nodeName.toLowerCase()) !== -1) {
		this.type = root.nodeName.toLowerCase();
		skipRoot = true;
	}
	var x = null;
	var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, x, false);
	while (treeWalker.nextNode()) {
		var node = treeWalker.currentNode;
		if (skipRoot && node === root) {
			continue;
		}
		if (node.nodeType === 3) {
			var parts = node.nodeValue.split(' ');
			var preSpace = '';
			parts.forEach(function (part) {
				if (part === '') {
					preSpace += ' ';
				} else {
					this.words.push(new Word(preSpace + part, this));
					preSpace = '';
				}
			}, this);
			if (preSpace != '') {
				this.words.push(new Word(preSpace, this));
			}
		} else {
			this.words.push(new Word('<' + node.nodeName + '>', this));
		}
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

	toString: function () {
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


var Word = function (text, parent) {
	this.parent = parent;

	this.chars = [];
	var chars = (text) ? Array.prototype.slice.call(text) : [];
	chars.forEach(function (char) {
		this.chars.push(new Char(char, this));
	}, this);
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

	toString: function () {
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


var Char = function (char, parent) {
	this.parent = parent;

	this.char = char || '';
	this.props = {};
}

Char.prototype = {
	toString: function () {
		var str = this.char;
		this.getProps().forEach(function (prop) {
			str += '(' + prop + ')';
		}, this);
		return str;
	},

	getProps: function () {
		var props = [];
		Object.keys(this.props).forEach(function (prop) {
			if (this.props[prop]) {
				props.push(prop);
			}
		}, this);
		return props;
	},

	toHTML: function () {
		return this.char;
	}
}


var Words = function (selector) {
	this.element = document.querySelector(selector);
	this.element.setAttribute('contenteditable', true);
	this.element.innerHTML = '<p><br/></p>';

	Util.on(this.element, 'keyup', this.onInput.bind(this));

	this.doc = new Document(this.element);

	Array.prototype.slice.call(document.querySelectorAll('button')).forEach(function (button) {
		Util.on(button, 'click', this.onToolbarButtonClick.bind(this));
	}, this);
}

Words.prototype = {

	onToolbarButtonClick: function (event) {
		var target = event.currentTarget;
		if (target.hasAttribute('data-custom-action')) {
			this.execCustomAction(target.getAttribute('data-custom-action'));
		} else {
			document.execCommand(event.currentTarget.getAttribute('data-action'), null, false);
			this.updateState(this.element);
		}
	},

	execCustomAction: function (action) {
		var selection = this.exportSelection(this.element);
		document.getElementById('previous-state').value = this.doc.toString();
		this.doc.execAction(action, selection);
		this.element.innerHTML = this.doc.toHTML();
		this.importSelection(selection, this.element);
		document.getElementById('new-state').value = this.doc.toString();
	},

	updateState: function (element) {
		var newDoc = new Document(element);
		document.getElementById('previous-state').value = this.doc.toString();
		document.getElementById('new-state').value = newDoc.toString();
		this.doc = newDoc;
	},

	onInput: function (event) {
		this.updateState(event.currentTarget);
	},

	exportSelection: function (root) {
        if (!root) {
            return null;
        }

        var selectionState = null,
            selection = document.getSelection();

        if (selection.rangeCount > 0) {
            var range = selection.getRangeAt(0),
                preSelectionRange = range.cloneRange(),
                start;

            preSelectionRange.selectNodeContents(root);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            start = preSelectionRange.toString().length;

            selectionState = {
                start: start,
                end: start + range.toString().length
            };
        }

        return selectionState;
    },

    importSelection: function (selectionState, root) {
        if (!selectionState || !root) {
            return;
        }

        var range = document.createRange();
        range.setStart(root, 0);
        range.collapse(true);

        var node = root,
            nodeStack = [],
            charIndex = 0,
            foundStart = false,
            stop = false,
            nextCharIndex;

        while (!stop && node) {
            if (node.nodeType === 3) {
                nextCharIndex = charIndex + node.length;
                if (!foundStart && selectionState.start >= charIndex && selectionState.start <= nextCharIndex) {
                    range.setStart(node, selectionState.start - charIndex);
                    foundStart = true;
                }
                if (foundStart && selectionState.end >= charIndex && selectionState.end <= nextCharIndex) {
                    range.setEnd(node, selectionState.end - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                var i = node.childNodes.length - 1;
                while (i >= 0) {
                    nodeStack.push(node.childNodes[i]);
                    i -= 1;
                }
            }
            if (!stop) {
                node = nodeStack.pop();
            }
        }

        var sel = document.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
}