var Util = {

	blockNames: ['address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'noscript', 'ol', 'p', 'pre', 

	'article', 'aside', 'audio', 'canvas', 'dd', 'figcaption', 'figure', 'footer', 'hgroup', 'main', 'nav', 'output', 'section', 'table', 'tfoot', 'ul', 'video',

	'dt', 'li', 'tbody', 'td', 'th', 'thead', 'tr'],

	on: function (target, event, listener, useCapture) {
        target.addEventListener(event, listener, useCapture);
    }
}

var Block = function () {
	this.words = [];
}

Block.prototype = {
	toString: function () {
		if (!this.words.length) {
			return '<br/>';
		} else {
			return this.words.join(' ');
		}
	}
}


var Word = function () {
	this.chars = [];
}

Word.prototype = {
	toString: function () {
		return this.chars.join();
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

	this.blocks = [new Block()];
}

Words.prototype = {
	onInput: function (event) {
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
		document.getElementById('output').value = event.currentTarget.textContent;
		// document.getElementById('output-inner').value = event.currentTarget.innerText;
	}
}