var ScrollableArea = function(x, y, w, h, params) {
	params = params || {};
	
	Phaser.Group.call(this, game);

	this._x = this.x = x;
	this._y = this.y = y;
	this._w = w;
	this._h = h;
	
	this.maskGraphics = game.add.graphics(x, y);
	this.maskGraphics.beginFill(0x000000);
	this.maskGraphics.drawRect(0, 0, w, h);
	this.maskGraphics.alpha = 0.2;
	this.maskGraphics.inputEnabled = true;
	this.mask = this.maskGraphics;
	
	this.dragging = false;
	this.pressedDown = false;
	this.timestamp = 0;
	this.callbackID = 0;

	this.targetX = 0;
	this.targetY = 0;

	this.autoScrollX = false;
	this.autoScrollY = false;

	this.startX = 0;
	this.startY = 0;

	this.velocityX = 0;
	this.velocityY = 0;

	this.amplitudeX = 0;
	this.amplitudeY = 0;

	this.directionWheel = 0;

	this.velocityWheelX = 0;
	this.velocityWheelY = 0;

	this.settings = {
			kineticMovement: true,
			timeConstantScroll: 325, //really mimic iOS
			horizontalScroll: true,
			verticalScroll: true,
			horizontalWheel: false,
			verticalWheel: true,
			deltaWheel: 40
	};
	
	this.configure(params);

	this.addChild = function(child) {
		this.maskGraphics.x = this.parent.x + this._x;
		this.maskGraphics.y = this.parent.y + this._y;
		ScrollableArea.prototype.addChild.call(this, child);
	}
}

ScrollableArea.prototype = Object.create(Phaser.Group.prototype);
ScrollableArea.prototype.constructor = ScrollableArea;

/**
* Change Default Settings of the plugin
*
* @method ScrollableArea#configure
* @param {Object}  [options] - Object that contain properties to change the behavior of the plugin.
* @param {number}  [options.timeConstantScroll=325] - The rate of deceleration for the scrolling.
* @param {boolean} [options.kineticMovement=true]   - Enable or Disable the kinematic motion.
* @param {boolean} [options.horizontalScroll=true]  - Enable or Disable the horizontal scrolling.
* @param {boolean} [options.verticalScroll=false]   - Enable or Disable the vertical scrolling.
* @param {boolean} [options.horizontalWheel=true]   - Enable or Disable the horizontal scrolling with mouse wheel.
* @param {boolean} [options.verticalWheel=false]    - Enable or Disable the vertical scrolling with mouse wheel.
* @param {number}  [options.deltaWheel=40]          - Delta increment of the mouse wheel.
*/
ScrollableArea.prototype.configure = function (options) {
	if (options) {
			for (var property in options) {
					if (this.settings.hasOwnProperty(property)) {
							this.settings[property] = options[property];
					}
			}
	}
};

/**
* Start the Plugin.
*
* @method ScrollableArea#start
*/
ScrollableArea.prototype.start = function () {
	this.game.input.onDown.add(this.beginMove, this);
	this.callbackID = this.game.input.addMoveCallback(this.moveCanvas, this);
	this.game.input.onUp.add(this.endMove, this);
	this.game.input.mouse.mouseWheelCallback = this.mouseWheel.bind(this);
};

/**
* Event triggered when a pointer is pressed down, resets the value of variables.
*/
ScrollableArea.prototype.beginMove = function () {
		if (this.maskGraphics.getBounds().contains(this.game.input.x, this.game.input.y)) {
			this.startedInside = true;
			
			this.startX = this.game.input.x;
			this.startY = this.game.input.y;
			this.pressedDown = true;
			this.timestamp = Date.now();
			this.velocityY = this.amplitudeY = this.velocityX = this.amplitudeX = 0;
		}
		else {
			this.startedInside = false;
		}
};

/**
* Event triggered when the activePointer receives a DOM move event such as a mousemove or touchmove.
* The camera moves according to the movement of the pointer, calculating the velocity.
*/
ScrollableArea.prototype.moveCanvas = function (pointer, x, y) {
		if (!this.pressedDown) return;

		this.now = Date.now();
		var elapsed = this.now - this.timestamp;
		this.timestamp = this.now;

		if (this.settings.horizontalScroll) {
				var delta = x - this.startX; //Compute move distance
				if (delta !== 0) this.dragging = true;
				this.startX = x;
				this.velocityX = 0.8 * (1000 * delta / (1 + elapsed)) + 0.2 * this.velocityX;
				this.x += delta;
		}

		if (this.settings.verticalScroll) {
				var delta = y - this.startY; //Compute move distance
				if (delta !== 0) this.dragging = true;
				this.startY = y;
				this.velocityY = 0.8 * (1000 * delta / (1 + elapsed)) + 0.2 * this.velocityY;
				this.y += delta;
		}
		
		this.limitMovement();

};

/**
* Event triggered when a pointer is released, calculates the automatic scrolling.
*/
ScrollableArea.prototype.endMove = function () {
		if (this.startedInside) {
			this.pressedDown = false;
			this.autoScrollX = false;
			this.autoScrollY = false;

			if (!this.settings.kineticMovement) return;

			this.now = Date.now();

			if(this.game.input.activePointer.withinGame) {
					if (this.velocityX > 10 || this.velocityX < -10) {
							this.amplitudeX = 0.8 * this.velocityX;
							this.targetX = Math.round(this.x + this.amplitudeX);
							this.autoScrollX = true;
					}

					if (this.velocityY > 10 || this.velocityY < -10) {
							this.amplitudeY = 0.8 * this.velocityY;
							this.targetY = Math.round(this.y + this.amplitudeY);
							this.autoScrollY = true;
					}
			}
			if (!this.game.input.activePointer.withinGame) {
					this.velocityWheelXAbs = Math.abs(this.velocityWheelX);
					this.velocityWheelYAbs = Math.abs(this.velocityWheelY);
					if (this.settings.horizontalScroll && (this.velocityWheelXAbs < 0.1 || !this.game.input.activePointer.withinGame)) {
							this.autoScrollX = true;
					}
					if (this.settings.verticalScroll && (this.velocityWheelYAbs < 0.1 || !this.game.input.activePointer.withinGame)) {
							this.autoScrollY = true;
					}
			}
		}
};

/**
* Event called after all the core subsystems and the State have updated, but before the render.
* Create the deceleration effect.
*/
ScrollableArea.prototype.update = function () {
		
		this.elapsed = Date.now() - this.timestamp;
		this.velocityWheelXAbs = Math.abs(this.velocityWheelX);
		this.velocityWheelYAbs = Math.abs(this.velocityWheelY);

		if (this.autoScrollX && this.amplitudeX != 0) {
				var delta = -this.amplitudeX * Math.exp(-this.elapsed / this.settings.timeConstantScroll);
				if (delta > 0.5 || delta < -0.5) {
						this.x = this.targetX + delta;
				}
				else {
						this.autoScrollX = false;
						//this.x = -this.targetX;
				}
		}

		if (this.autoScrollY && this.amplitudeY != 0) {

				var delta = -this.amplitudeY * Math.exp(-this.elapsed / this.settings.timeConstantScroll);
				if (delta > 0.5 || delta < -0.5) {
						this.y = this.targetY + delta;
				}
				else {
						this.autoScrollY = false;
						//this.y = -this.targetY;
				}
		}

		if(!this.autoScrollX && !this.autoScrollY){
				this.dragging = false;
		}
		
		if (this.settings.horizontalWheel  && this.velocityWheelXAbs > 0.1) {
				this.dragging = true;
				this.amplitudeX = 0;
				this.autoScrollX = false;
				this.x += this.velocityWheelX;
				this.velocityWheelX *= 0.95;
		}

		if (this.settings.verticalWheel && this.velocityWheelYAbs > 0.1) {
				this.dragging = true;
				this.autoScrollY = false;
				this.y += this.velocityWheelY;
				this.velocityWheelY *= 0.95;
		}
		
		this.limitMovement();
};

/**
* Event called when the mousewheel is used, affect the direction of scrolling.
*/
ScrollableArea.prototype.mouseWheel = function (event) {
		if (!this.settings.horizontalWheel && !this.settings.verticalWheel) return;

		event.preventDefault();

		var delta = this.game.input.mouse.wheelDelta * 120 / this.settings.deltaWheel;

		if (this.directionWheel != this.game.input.mouse.wheelDelta) {
				this.velocityWheelX = 0;
				this.velocityWheelY = 0;
				this.directionWheel = this.game.input.mouse.wheelDelta;
		}

		if (this.settings.horizontalWheel) {
				this.autoScrollX = false;

				this.velocityWheelX += delta;
		}

		if (this.settings.verticalWheel) {
				this.autoScrollY = false;

				this.velocityWheelY += delta;
		}

};

/**
* Stop the Plugin.
*
* @method ScrollableArea#stop
*/
ScrollableArea.prototype.stop = function () {
		this.game.input.onDown.remove(this.beginMove, this);

		if (this.callbackID) {
				this.game.input.deleteMoveCallback(this.callbackID);
		}
		else {
				this.game.input.deleteMoveCallback(this.moveCanvas, this);
		}

		this.game.input.onUp.remove(this.endMove, this);

		this.game.input.mouse.mouseWheelCallback = null;

};

/**
* Reposition the scroller
*/
ScrollableArea.prototype.setPosition = function(position) {
    if (position.x) {
      this.x += position.x - this._x;
			this.maskGraphics.x = this._x = position.x;
		}
    if (position.y) {
      this.y += position.y - this._y;
			this.maskGraphics.y = this._y = position.y;
		}
}

/**
* Prevent overscrolling.
*/
ScrollableArea.prototype.limitMovement = function() {
	if (this.settings.horizontalScroll) {
		if (this.x > this._x)
			this.x = this._x;
		if (this.x < -(this.width-this._w-this._x)) {
			if (this.width > this._w) {
				this.x = -(this.width-this._w-this._x);
			}
			else {
				this.x = this._x;
			}
		}
	}
	
	if (this.settings.verticalScroll) {
		if (this.y > this._y)
			this.y = this._y;
		if (this.y < -(this.height-this._h-this._y)) {
			if (this.height > this._h) {
				this.y = -(this.height-this._h-this._y);
			}
			else {
				this.y = this._y;
			}
		}
	}
}