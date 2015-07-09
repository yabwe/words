var Util = {

	blockNames: ['address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'noscript', 'ol', 'p', 'pre',

	'article', 'aside', 'audio', 'canvas', 'dd', 'figcaption', 'figure', 'footer', 'hgroup', 'main', 'nav', 'output', 'section', 'table', 'tfoot', 'ul', 'video',

	'dt', 'li', 'tbody', 'td', 'th', 'thead', 'tr'],

	on: function (target, event, listener, useCapture) {
        target.addEventListener(event, listener, useCapture);
    }
}


var Document = function (text) {
	this.chars = [];
	this.blocks = [new Block(null, this)];
	this.chars = this.chars.concat(this.blocks[0].getChars());

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

		if (nextChar) {
			nextWord = nextChar.parent;
		}
		if (prevChar) {
			prevWord = prevChar.parent;
		}

		if (nextWord === prevWord || !prevWord) {
			nextWord.insertBefore(nextChar, newChars);
		} else {
			if (prevChar.char === ' ') {
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

		removedChars[0].parent.removeChars(removedChars);
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

	toDebugString: function () {
		return this.blocks.join('\r\n');
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

	removeChars: function (chars) {
		if (!chars || !chars.length) {
			return;
		}

		chars.forEach(function (char) {
			var index = this.chars.indexOf(char);
			if (index !== -1) {
				this.chars.splice(index, 1);
			}
		}, this);
	},

	toString: function () {
		return this.chars.join('');
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


var Char = function (char, parent) {
	this.parent = parent;

	this.char = char || '';
	this.props = {};
}

Char.prototype = {

	toString: function () {
		return this.char;
	},

	toDebugString: function () {
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

	Util.on(this.element, 'keyup', this.onInput.bind(this));

	this.doc = new Document(this.createHTMLWordString(this.element));

	Array.prototype.slice.call(document.querySelectorAll('button')).forEach(function (button) {
		Util.on(button, 'click', this.onToolbarButtonClick.bind(this));
	}, this);
}

Words.prototype = {

	createHTMLWordString: function (root) {
		var skipRoot = false;
		if (Util.blockNames.indexOf(root.nodeName.toLowerCase()) !== -1) {
			skipRoot = true;
		}
		var x = null;
		var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, x, false);
		var str = '';
		while (treeWalker.nextNode()) {
			var node = treeWalker.currentNode;
			if (skipRoot && node === root) {
				continue;
			}
			if (node.nodeType === 3) {
				str += node.nodeValue;
			} else {
				if (str !== '' && Util.blockNames.indexOf(node.nodeName.toLowerCase()) !== -1) {
					str += '\r\n';
				}
			}
		}
		return str;
	},

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
		var nextStr = this.createHTMLWordString(element);
		var currStr = this.doc.toString();
		document.getElementById('previous-state').value = currStr;
		var diff = JsDiff.diffChars(currStr, nextStr);
		var index = 0;
		diff.forEach(function (action) {
			if (action.removed) {
				this.doc.removeCharsAt(index, action.count);
			} else {
				if (action.added) {
					this.doc.insertCharsAt(index, action.value);
				}
				index += action.value.length;
			}
		}, this);
		var updatedStr = this.doc.toString();
		document.getElementById('new-state').value = updatedStr;
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