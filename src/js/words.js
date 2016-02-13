var Words = function (selector) {
	this.element = document.querySelector(selector);
	this.element.setAttribute('contenteditable', true);

	Util.on(this.element, 'input', this.onInput.bind(this));

	this.doc = new Document(Util.createHTMLWordString(this.element));

	// Attach to click for the toolbar
	Array.prototype.slice.call(document.querySelectorAll('button')).forEach(function (button) {
		Util.on(button, 'click', this.onToolbarButtonClick.bind(this));
	}, this);

	if (TreeUX) {
		// Just for help while developing, create a visualization
		// that shows the JSON tree-structure while text is being edited
		this.treeUx = new TreeUX('tree-ux');
	}

	// Build tree from initial content
	this.updateState(this.element);
}

Words.prototype = {

	onToolbarButtonClick: function (event) {
		var target = event.currentTarget;
		if (target.hasAttribute('data-custom-action')) {
			this.execCustomAction(target.getAttribute('data-custom-action'));
		}
	},

	execCustomAction: function (action) {
		// Export selection, getting start character and end character
		var selection = Util.exportSelection(this.element);

		// Execute action, providing given selection
		this.doc.execAction(action, selection);

		// Replace the current content with the generated HTML
		this.element.innerHTML = this.doc.toHTML();

		// Restore the selection before the action occurred
		Util.importSelection(selection, this.element);
	},

	updateState: function (element) {
		var nextStr = Util.createHTMLWordString(element), // text representation of current DOM
			currStr = this.doc.toString(), // text representation of the current tree
			diff = JsDiff.diffChars(currStr, nextStr), // JsDiff of two strings
			index = 0;

		/* Iterate through array of diffs detected by JSDiff
		 *
		 * Each 'diff' is an object that represents a part of the string:
		 *
		 * {
		 *    added: true/undefined (True if this represents a chunk of text that was added)
		 *    removed: true/undefined (True if this represents a chunk of text that was removed)
		 *    value: string (The chunk of text this diff covers)
		 *    count: int (The length of this chunk of text)
		 * }
		 *
		 * NOTE: If added and removed are both undefined this chunk of text text was unchanged
		 */
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

		// For development only, update the tree visualization
		var js = this.doc.toJSON();
		if (this.treeUx) {
			this.treeUx.update(js);
		}
	},

	onInput: function (event) {
		this.updateState(event.currentTarget);
	}
}