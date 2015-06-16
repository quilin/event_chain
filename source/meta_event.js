var MetaEvent = function () {
	this._events = [];
	this._closingEvent = null;
	this._currentEvent = null;

	this.closed = false;
	this.id = GuidFactory.create();
	this.name = "me_" + this.id;
};
MetaEvent.prototype = {
	push: function (evt) {
		if (this.closed)
			throw new Error("Cannot push event to closed MetaEvent");

		this._events.push(evt);
	},
	close: function (evt) {
		if (this.closed)
			throw new Error("Cannot close already closed MetaEvent");

		this._closingEvent = evt;
		this.closed = true;
	},

	init: function (stateMachine) {
		this._createEventIndex();
		this._stateMachine = stateMachine;
		for (var id in this._eventIndex) {
			this._initEvent(this._eventIndex[id]);
		}
	},
	dispose: function () {
		for (var id in this._eventIndex) {
			this._eventIndex[id].dispose();
		}
	},

	_initEvent: function (evt) {
		var _this = this;

		evt.init();
		evt.on(function (evt) {
			if (this.id === _this._closingEvent.id &&
				this.callback.apply(this.context || this.element, [evt]) !== BaseEvent.Rejected) {
				_this._stateMachine[_this.name]();
			} else if (this.id === _this._currentEvent.id) {
				this.callback.apply(this.context || this.element, [evt]);
			} else if (this.type !== _this._currentEvent.type &&
				this.callback.apply(this.context || this.element, [evt]) !== BaseEvent.Rejected) {
				_this._disposePreviousEvents(this.id);
				_this._currentEvent = _this._eventIndex[this.id];
			}
		});
	},
	_createEventIndex: function () {
		this._eventIndex = {};
		for (var i = 0; i < this._events.length; ++i) {
			var evt = this._events[i];
			this._eventIndex[evt.id] = evt;
		}
		this._eventIndex[this._closingEvent.id] = this._closingEvent;

		this._currentEvent = this._events[0] || this._closingEvent;
	},
	_disposePreviousEvents: function (eventId) {
		for (var i = 0; i < this._events.length; ++i) {
			var evt = this._events[i];
			if (evt.id !== eventId) {
				evt.dispose();
			} else {
				break;
			}
		}
	}
};