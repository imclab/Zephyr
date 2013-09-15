function Slider(options)
{
	this.x = options.x;
	this.y = options.y;
	this.value = options.value || 50;
	this.sliderX = options.x + this.value;
	this.idleImage = "resources/img/UI/Slider.png";
	this.hoverImage = "resources/img/UI/Slider.png";
	this.dragging = false;
	this.lastMouseX = scorch.mouse_x;
	this.init = true;

	scorch.Entity.call(this, options);

	this.setImage(this.idleImage);

	this.halfWidth = this.image.width / 2;
	this.halfHeight = this.image.height / 2;

	this.lowX = this.x - 202 + this.halfWidth;
	this.highX = this.x + 202 - this.halfWidth;

	this.update = function()
	{
		if(scorch.mouse_x <= this.x + this.halfWidth && scorch.mouse_x >= this.x - this.halfWidth && scorch.mouse_y <= this.y + this.halfHeight && scorch.mouse_y >= this.y - this.halfHeight)
		{
			if(scorch.pressedWithoutRepeat("left_mouse_button"))
			{
				this.dragging = true;
			}
		}
		if(!scorch.pressed("left_mouse_button"))
		{
			this.dragging = false;
		}
		if(this.dragging)
		{
			this.x = scorch.mouse_x;
			if(scorch.mouse_x < this.lowX) this.x = this.lowX;
			if(scorch.mouse_x > this.highX) this.x = this.highX;
			this.value = (this.x - 214) / 372;
		}
	}

	this.draw = function()
	{
		if(!this.image)
		{
			return this;
		}

		this.context.save();
		this.context.translate(this.x, this.y);
		if(this.angle!=0)
		{
			scorch.context.rotate(this.angle * Math.PI / 180);
		}
		this.flipped && this.context.scale(-1, 1);
		this.context.globalAlpha = this.alpha;
		this.context.translate(-this.left_offset, -this.top_offset);
		this.context.drawImage(this.image, 0, 0, this.width, this.height);
		this.context.restore();
	}
}
Slider.prototype = scorch.Entity.prototype;