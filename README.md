Small library to create simple event chains to handle
It does nothing more than providing you with this cute cyntax.
Can be pretty useful in drag'n'drops, web-version of graphical editors and browser games.

You can describe the simple chain of events like this:

  var elementToGetEventsFrom = document.getElementById("MyEventLayer");
  var eventChain = new EventChain(elementToGetEventsFrom)
    .once("click", function () { console.log("Initial click!"); });
    .once("click", document.body, function () { this.log("Body clicked!"); }, console)
    .any("mousemove", document, function (evt) { console.log(evt.clientX, evt.clientY); })
    .once({ keydown: 27 }, function () { console.log("27 keydown"); })
    .cancel({ keydown: 32})
    .atLast(function () { console.log("Chain is done"); });

  eventChain.init();

It works this way:
1. We see the "once" handler for "click" event, so we first attach a listener to the element with Id "MyEventLayer".
2. When it fires, we detach previous step event, call the handler function (logging into console) and attach listener to next event, which is "click" on a body.
3. Once body click event (it will bubble, i believe, from the first event, unless you prevent it) fires, we attach TWO event listeners: one to document mousemove and one for keydown: 27. Every time mousemove is fired we do nothing but handling it with the followed function. But when the keydown event fires (for it is "once" type), we detach both mousemove and keydown events and call the keydown handler.
4. Once the last event in chain is fired, the atLast handler is being called.
5. If at any moment between initiating and completing chain the "cancel" event fires, it will instantly dispose the chain. You can also pass the handler to "cancel" method so it could do something before this or return BaseEvent.Rejected to prevent disposing.

TIPS:
1. You can prevent chain to go to next step even if event was fired if the handler function for event returns BaseEvent.Rejected.
2. You can manually dispose the eventChain by calling "dispose" method.
3. You can describe keyboard event in a simple way: { keydown: keyCode } or { keydown: [keyCode1, keyCode2] } or you can replace "keydown" word with "keyup" or "keypress".
4. Every handler function will recieve the event argument as the first one.
5. You can pass context for a handler as next argument.
6. Declaring the "cancel" and "atLast" is unneccesary. It also doesn't matter in which order you put those methods in your chain.
7. The chain that ends with "any" event will never de complete, unless you manually dispose it or user cancels it.
8. There are also shorter methods for you: like "twice" or "onceAndMore".

Cycle events.

Once and any creates some sort of regexp for your events. Any looks like /[e]+?/, once /[e]/. But what if you want not just one event but subchain of events to be handled any times? You can use the very same "any" method with different arguments:

  eventChain
    .any(function (chain) {
      return chain
        .once("mousedown", function (evt) { this.log("mousedown"); })
        .any("mousemove", document, function (evt) { this.log(evt.clientX, evt.clientY); })
        .once("mouseup", function (evt) { this.log("mouseup"); });
    }, console)
    .init();
    
The event chain you return from "any" handler should not have "atLast" event and should not be "init"iated. It will be handled by the library.
