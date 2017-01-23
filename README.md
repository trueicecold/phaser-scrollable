# Phaser scrollable component

This component can simulate vertical and horizontal scrolling to a Phaser.Group.

> This component is directly derived from [jdnichollsc](https://github.com/jdnichollsc)'s amazing work on his plugin, [Kinetic Scrolling Plugin](https://github.com/jdnichollsc/Phaser-Kinetic-Scrolling-Plugin). I converted it to use groups instead of moving the camera, added support for multiple scrollers, and some bug fixes.


### Download the Component

Install using [npm](https://www.npmjs.com/):

```bash
npm install https://github.com/trueicecold/phaser-scrollable --save
```

### Using the Component

```javascript
	this.scroller = game.add.existing(new ScrollableArea(x, y, w, h, params));
    var textStyle = {font:"30px Arial", fill:"#ffff00"};
	for (var i=0;i<10;i++) {
		for (var j=0;j<80;j++) {
			var text = game.make.text(i*330, j*30, "Yes, everything scrolls", textStyle);
			scroller.addChild(text);
		}
	}
	scroller.start();
```

* x - the x position of the scrollable container
* y - the y position of the scrollable container
* w - the width of the scrollable container. If the width of the children inside is larger than this, a horizontal scrolling will be possible.
* h - the height of the scrollable container. If the height of the children inside is larger than this, a vertical scrolling will be possible.
* params - configurable parameters for the component:
	* horizontalScroll - allow horizontal scroll. Default is true.
	* verticalScroll - allow vertical scroll. Default is true.
	* horizontalWheel - allow horizontal wheel support. Default is true. Should not be enabled along with verticalWheel.
	* verticalWheel - allow vertical wheel support. Default is false. Should not be enabled along with horizontalWheel.
	* kineticMovement - use kinetic scrolling. Default is true. Use false to switch to static scrolling (scrolling stops as you leave the touch).
	* timeConstantScroll - The rate of deceleration for the scrolling. Default is 325ms.
	* deltaWheel - Delta increment of the mouse wheel.

### Change the component parameters at runtime

```javascript
	scroller.configure(params);
```

### Methods
* start - start the scroller behavior.
* stop - stops the scroller behavior. this does not reset the content position.
* setPosition - object (x,y) - repositions the scroller.

### Demo

[https://cdn.rawgit.com/trueicecold/phaser-scrollable/e2bfe0cd/scrollable-kinetic.html](https://cdn.rawgit.com/trueicecold/phaser-scrollable/e2bfe0cd/scrollable-kinetic.html)

Made with <3 for <img src="https://phaser.io/images/logo/logo-download.png" width="80" height="80"/>