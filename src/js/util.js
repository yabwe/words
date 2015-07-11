var exists = function (v) {
	return v || v === '' || v === 0 || v === false;
}

var Util = {

	blockNames: ['address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'noscript', 'ol', 'p', 'pre',

	'article', 'aside', 'audio', 'canvas', 'dd', 'figcaption', 'figure', 'footer', 'hgroup', 'main', 'nav', 'output', 'section', 'table', 'tfoot', 'ul', 'video',

	'dt', 'li', 'tbody', 'td', 'th', 'thead', 'tr'],

	isNewLine: function (str) {
		return str === '\r\n' || str === '\n';
	},

	isSpace: function (str) {
		return !!(str.match(/^\s+$/) && str !== '\r');
	},

	on: function (target, event, listener, useCapture) {
		target.addEventListener(event, listener, useCapture);
	},

	createHTMLWordString: function (root) {
		var skipRoot = false;
		if (this.blockNames.indexOf(root.nodeName.toLowerCase()) !== -1) {
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
				if (this.blockNames.indexOf(node.nodeName.toLowerCase()) !== -1) {
					str += '\r\n';
				}
			}
		}
		return str;
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