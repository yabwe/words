var Words = function (selector) {
	this.element = document.querySelector(selector);
	this.element.setAttribute('contenteditable', true);

	Util.on(this.element, 'input', this.onInput.bind(this));

	this.doc = new Document(Util.createHTMLWordString(this.element));

	Array.prototype.slice.call(document.querySelectorAll('button')).forEach(function (button) {
		Util.on(button, 'click', this.onToolbarButtonClick.bind(this));
	}, this);

	this.treeUx = new TreeUX('tree-ux');
	this.updateState(this.element);
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
		var selection = Util.exportSelection(this.element);
		//document.getElementById('previous-state').value = this.doc.toString();
		this.doc.execAction(action, selection);
		this.element.innerHTML = this.doc.toHTML();
		Util.importSelection(selection, this.element);
		//document.getElementById('new-state').value = this.doc.toString();
	},

	updateState: function (element) {
		var nextStr = Util.createHTMLWordString(element);
		var currStr = this.doc.toString();
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
		var js = this.doc.toJSON();
		this.treeUx.update(js);
	},

	onInput: function (event) {
		this.updateState(event.currentTarget);
	}
}