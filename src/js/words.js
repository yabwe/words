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