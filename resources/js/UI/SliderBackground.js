function SliderBackground(options)
{
	this.x = options.x;
	this.y = options.y;
	this.idleImage = "resources/img/UI/Slider_Background.png";
	var dragging = false;
	
	scorch.Entity.call(this, options);

	this.setImage(this.idleImage);

	this.halfWidth = this.image.width / 2;
	this.halfHeight = this.image.height / 2;

	this.update = function()
	{

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
SliderBackground.prototype = scorch.Entity.prototype;