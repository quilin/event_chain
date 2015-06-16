var EventChain = function (element) {
	this._element = $(element);
	this._metaEvents = [];
	this._atLast = null;
};
EventChain.prototype = {
	_lastEvent: function () {
		return this._metaEvents.length > 0
			? this._metaEvents[this._metaEvents.length - 1]
			: null;
	},
	_createEventIndex: function () {
		this._eventIndex = {};
		for (var i = 0; i < this._metaEvents.length; ++i) {
			var evt = this._metaEvents[i];
			this._eventIndex[evt.id] = evt;
		}
	},
	_createEvents: function () {
		return this._metaEvents.map(function (evt, index, metaEvents) {
			return {
				name: evt.name,
				from: evt.id,
				to: index + 1 < metaEvents.length
					? metaEvents[index + 1].id
					: "atLast"
			}
		});
	},
	_createCallbacks: function () {
		var result = {},
			_this = this;
		for (var i in this._eventIndex) {
			result["onenter" + this._eventIndex[i].id] = function (evt, from, to, data) {
				_this._eventIndex[to].init(this);
			}
			result["onleave" + this._eventIndex[i].id] = function (evt, from, to, data) {
				if (_this._eventIndex[from]) {
					_this._eventIndex[from].dispose();
				}
			}
		}
		result["onatLast"] = function (evt, from, to) {
			if (_this._eventIndex[from]) {
				_this._eventIndex[from].dispose();
			}
			if (_this._atLastCallback) {
				_this._atLastCallback.apply(
					_this._atLastContext || _this._element,
					arguments);
			}
		};
		return result;
	},
	
	// add event that will be handled only once
	once: function (type, element, callback, context) {
		if (element instanceof Function) {
			context = callback;
			callback = element;
			element = this._element;
		}

		var lastEvent = this._lastEvent();
		if (lastEvent && !lastEvent.closed) {
			lastEvent.close(new BaseEvent(type, element, callback, context));
		} else {
			var evt = new MetaEvent();
			evt.close(new BaseEvent(type, element, callback, context));
			this._metaEvents.push(evt);
		}

		return this;
	},

	// add event that will be handled twice
	twice: function (type, element, callback, context) {
		return this
			.once(type, element, callback, context)
			.once(type, element, callback, context);
	},

	// add event that will be repeated any times
	any: function (type, element, callback, context) {
		if (type instanceof Function) {
			return this._cycle(type, element)
		} else if (element instanceof Function) {
			context = callback;
			callback = element;
			element = this._element;
		}

		var lastEvent = this._lastEvent();
		if (lastEvent && !lastEvent.closed) {
			lastEvent.push(new BaseEvent(type, element, callback, context));
		} else {
			var evt = new MetaEvent();
			evt.push(new BaseEvent(type, element, callback, context));
			this._metaEvents.push(evt);
		}

		return this;
	},

	// add event that will be repeated at least once
	onceAndMore: function (type, element, callback, context) {
		return this
			.once(type, element, callback, context)
			.any(type, element, callback, context);
	},

	// add cycle of events with same syntax
	_cycle: function (cycle, context) {
		var lastEvent = this._lastEvent();
		if (lastEvent && !lastEvent.closed) {
			lastEvent.push(new CycleEvent(cycle, this._element, context));
		} else {
			var evt = new MetaEvent();
			evt.push(new CycleEvent(cycle, this._element, context));
			this._metaEvents.push(evt);
		}

		return this;
	},

	// set function that will be called after queue is done
	atLast: function (callback, context) {
		this._atLastCallback = callback;
		this._atLastContext = context;
		return this;
	},

	// set event that will cancel queue immediately
	cancel: function (type, element, callback, context) {
		var _this = this;
		if (element instanceof Function) {
			context = callback;
			callback = element;
			element = this._element;
		}

		new BaseEvent(type, element, callback, context)
			.on("caught", function (evt) {
				if (this.callback.apply(this.context || this.element, [evt]) !== false) {
					_this.dispose();
				}
			})
			.init();

		return this;
	},

	// initialize state machine
	init: function () {
		var lastEvent = this._lastEvent();
		if (!lastEvent || !lastEvent.closed) {
			this.once("notgonnahappen");
		}

		this._createEventIndex();
		var callbacks = this._createCallbacks(),
			events = this._createEvents(),
			stateMachine = StateMachine.create({
				initial: this._metaEvents[0].id,
				final: "atLast",
				events: events,
				callbacks: callbacks
			});

		return this;
	},
	dispose: function () {
		for (var i = 0; i < this._metaEvents.length; ++i) {
			this._metaEvents[i].dispose();
		}
	}
};