function RadioButton(options)
{
	this.x = options.x;
	this.y = options.y;
	this.isOn = options.isOn || true;
	this.action = options.action || function(){console.log("Default Button Action");};
	if(this.isOn)
	{
		this.idleImage = "resources/img/UI/Radio_Button_On.png";
		this.hoverImage = "resources/img/UI/Radio_Button_On.png";
	}
	else
	{
		this.idleImage = "resources/img/UI/Radio_Button_Off.png";
		this.hoverImage = "resources/img/UI/Radio_Button_Off.png";
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
		if(this.isOn)
		{
			this.idleImage = "resources/img/UI/Radio_Button_On.png";
			this.hoverImage = "resources/img/UI/Radio_Button_On.png";
		}
		else
		{
			this.idleImage = "resources/img/UI/Radio_Button_Off.png";
			this.hoverImage = "resources/img/UI/Radio_Button_Off.png";
		}
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
RadioButton.prototype = scorch.Entity.prototype;