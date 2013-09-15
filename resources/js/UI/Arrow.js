function Arrow(options)
{
	this.x = options.x;
	this.y = options.y;
	this.direction = options.direction || "Left";
	this.action = options.action || function(){console.log("Default Button Action");};
	if(this.direction == "Right")
	{
		this.idleImage = "resources/img/UI/Arrow_Right.png";
		this.hoverImage = "resources/img/UI/Arrow_Right_Hover.png";
	}
	else if(this.direction == "Left")
	{
		this.idleImage = "resources/img/UI/Arrow_Left.png";
		this.hoverImage = "resources/img/UI/Arrow_Left_Hover.png";
	}
	else if(this.direction == "Up")
	{
		this.idleImage = "resources/img/UI/Arrow_Up.png";
		this.hoverImage = "resources/img/UI/Arrow_Up_Hover.png";
	}
	else if(this.direction == "Down")
	{
		this.idleImage = "resources/img/UI/Arrow_Down.png";
		this.hoverImage = "resources/img/UI/Arrow_Down_Hover.png";
	}
	
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
	}
}
Arrow.prototype = scorch.Entity.prototype;