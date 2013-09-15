function Button(options)
{
	this.x = options.x;
	this.y = options.y;
	this.text = options.text || "Submit";
	this.textColor = options.textColor || "White";
	this.action = options.action || function(){console.log("Default Button Action");};
	this.idleImage = options.idleImage || "resources/img/UI/CF_Button.png";
	this.hoverImage = options.hoverImage || "resources/img/UI/CF_Button_Hover.png";

	scorch.Entity.call(this, options);

	this.setImage(this.idleImage);

	this.halfWidth = this.image.width / 2;
	this.halfHeight = this.image.height / 2;

	this.setHoverImage = function(image)
	{
		this.hoverImage = image;
	}

	this.setAction = function(action)
	{
		this.action = action;
	}

	this.update = function()
	{
		if(scorch.mouse_x <= this.x + this.halfWidth && scorch.mouse_x >= this.x - this.halfWidth && scorch.mouse_y <= this.y + this.halfHeight && scorch.mouse_y >= this.y - this.halfHeight)
		{
			this.setImage(this.hoverImage);
			if(scorch.pressedWithoutRepeat("left_mouse_button"))
			{
				this.action();
			}
		}
		else
		{
			this.setImage(this.idleImage);
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

		scorch.context.font = "bold 22pt terminal";
		scorch.context.textAlign = "center";
		scorch.context.textBaseline = "middle";
		scorch.context.fillStyle =  this.textColor;
		scorch.context.fillText(this.text, this.x, this.y);
	}
}
Button.prototype = scorch.Entity.prototype;