var Util = {

	blockNames: ['address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'noscript', 'ol', 'p', 'pre',

	'article', 'aside', 'audio', 'canvas', 'dd', 'figcaption', 'figure', 'footer', 'hgroup', 'main', 'nav', 'output', 'section', 'table', 'tfoot', 'ul', 'video',

	'dt', 'li', 'tbody', 'td', 'th', 'thead', 'tr'],

	on: function (target, event, listener, useCapture) {
        target.addEventListener(event, listener, useCapture);
    }
}


var Document = function (root) {
	if (!root) {
		this.blocks = [new Block()];
	} else {
		this.blocks = [];
		Array.prototype.slice.call(root.childNodes).forEach(function (element) {
			this.blocks.push(new Block(element));
		}, this);
	}
}

Document.prototype = {
	toString: function () {
		return this.blocks.join('\r\n');
	}
}



var Block = function (root) {
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
			parts.forEach(function (part) {
				this.words.push(new Word(part));
			}, this);
		} else {
			this.words.push(new Word('<' + node.nodeName + '>'));
		}
	}
}

Block.prototype = {
	type: 'p',

	toString: function () {
		var str = '<' + this.type + '>';
		if (!this.words.length) {
			str += '<br/>';
		} else {
			str += this.words.join(' ');
		}
		return str + '</' + this.type + '>';
	}
}


var Word = function (text) {
	this.chars = (text) ? Array.prototype.slice.call(text) : [];
}

Word.prototype = {
	toString: function () {
		return this.chars.join('');
	}
}


var Char = function () {
	this.char = '';
}

Char.prototype = {
	toString: function () {
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
		document.execCommand(event.currentTarget.getAttribute('data-action'), null, false);
		this.updateState(this.element);
	},

	updateState: function (element) {
		var newDoc = new Document(element);
		document.getElementById('previous-state').value = this.doc.toString();
		document.getElementById('new-state').value = newDoc.toString();
		this.doc = newDoc;
	},

	onInput: function (event) {
		this.updateState(event.currentTarget);

		/*
		var x = null;
		var treeWalker = document.createTreeWalker(event.currentTarget, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, x, false);
		var str = '';
		while(treeWalker.nextNode()) {
			var node = treeWalker.currentNode;
			if (node.nodeType === 3) {
				str += node.nodeValue;
			} else {
				if (str.length && Util.blockNames.indexOf(node.nodeName.toLowerCase()) !== -1) {
					str += '\r\n';
				}
			}
		}
		document.getElementById('output-inner').value = str + 'END';
		document.getElementById('output').value = event.currentTarget.textContent;*/
		// document.getElementById('output-inner').value = event.currentTarget.innerText;
	}
}