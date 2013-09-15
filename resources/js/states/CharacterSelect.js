function characterSelect()
{
	var cursor;

	var selectedShip;
	var color = 0;

	var arrow_left, arrow_right, arrow_up, arrow_down;
	var selectButton;
	var playButtons;

	this.Init = function()
	{
		// Interface
		cursor = new scorch.Entity({x: scorch.mouse_x,
									y: scorch.mouse_y,
									anchor: "center",
									image: "resources/img/UI/Reticle.png"
								});

		selectedShip = new SelectedShip({x: scorch.width / 2,
										 y: scorch.height / 2,
										 image: "resources/img/Characters/Ships/ship1Green.png",
										 anchor: "center",
										 mirrored: "horizontal"
										});

		selectButton = new Button({x: scorch.width / 2,
								   y: scorch.height - 50,
								   text: "Select",
								   action: function(){scorch.switchGameState(missionState)},
								   anchor: "center"
								});

		arrow_left = new Arrow({ x: scorch.width / 4,
							     y: scorch.height / 2,
							     direction: "Left",
							     action: function(){selectedShip.lastShip()},
							     anchor: "center"
								});

		arrow_right = new Arrow({x: (scorch.width / 4) + (scorch.width / 2),
							     y: scorch.height / 2,
							     direction: "Right",
							     action: function(){selectedShip.nextShip()},
							     anchor: "center"
								});

		arrow_up = new Arrow({x: scorch.width / 2,
							     y: 125,
							     direction: "Up",
							     action: function(){selectedShip.nextColor()},
							     anchor: "center"
								});

		arrow_down = new Arrow({x: scorch.width / 2,
							     y: scorch.height - 125,
							     direction: "Down",
							     action: function(){selectedShip.lastColor()},
							     anchor: "center"
								});
	}

	this.Update = function()
	{
		cursor.x = scorch.mouse_x;
		cursor.y = scorch.mouse_y;

		selectButton.update();
		arrow_left.update();
		arrow_right.update();
		arrow_up.update();
		arrow_down.update();
	}

	this.Draw = function()
	{
		// Clear
		scorch.clear();

		// Interface
		selectButton.draw();
		arrow_left.draw();
		arrow_right.draw();
		arrow_up.draw();
		arrow_down.draw();

		// Parts
		selectedShip.draw();

		// Cursor
		cursor.draw();
	}

	function SelectedShip(options)
	{
		this.x = options.x;
		this.y = options.y;
		this.image = options.image;
		var index = 0;

		scorch.Entity.call(this, options);

		this.nextShip = function()
		{
			index++;
			this.switchShip();
		}

		this.lastShip = function()
		{
			index--;
			this.switchShip();
		}

		this.nextColor = function()
		{
			color++;
			this.switchShip();
		}

		this.lastColor = function()
		{
			color--;
			this.switchShip();
		}

		this.switchShip = function()
		{
			switch(color)
			{
				case 0: // Green
					switch(index)
					{
						case 0:
							this.setImage("resources/img/Characters/Ships/ship1Green.png");
							ship.image = "resources/img/Characters/Ships/ship1Green.png";
						break;
						case 1:
							this.setImage("resources/img/Characters/Ships/ship2Green.png");
							ship.image = "resources/img/Characters/Ships/ship2Green.png";
						break;
						case 2:
							this.setImage("resources/img/Characters/Ships/ship3Green.png");
							ship.image = "resources/img/Characters/Ships/ship3Green.png";
						break;
						default:
							if(index > 2)
							{
								index = 0;
								this.setImage("resources/img/Characters/Ships/ship1Green.png");
								ship.image = "resources/img/Characters/Ships/ship1Green.png";
							}
							if(index < 0)
							{
								index = 2;
								this.setImage("resources/img/Characters/Ships/ship3Green.png");
								ship.image = "resources/img/Characters/Ships/ship3Green.png";
							}
						break;
					}
				break;
				case 1: // Grey
					switch(index)
					{
						case 0:
							this.setImage("resources/img/Characters/Ships/ship1Grey.png");
							ship.image = "resources/img/Characters/Ships/ship1Grey.png";
						break;
						case 1:
							this.setImage("resources/img/Characters/Ships/ship2Grey.png");
							ship.image = "resources/img/Characters/Ships/ship2Grey.png";
						break;
						case 2:
							this.setImage("resources/img/Characters/Ships/ship3Grey.png");
							ship.image = "resources/img/Characters/Ships/ship3Grey.png";
						break;
						default:
							if(index > 2)
							{
								index = 0;
								this.setImage("resources/img/Characters/Ships/ship1Grey.png");
								ship.image = "resources/img/Characters/Ships/ship1Grey.png";
							}
							if(index < 0)
							{
								index = 2;
								this.setImage("resources/img/Characters/Ships/ship3Grey.png");
								ship.image = "resources/img/Characters/Ships/ship3Grey.png";
							}
						break;
					}
				break;
				case 2: // Red
					switch(index)
					{
						case 0:
							this.setImage("resources/img/Characters/Ships/ship1Red.png");
							ship.image = "resources/img/Characters/Ships/ship1Red.png";
						break;
						case 1:
							this.setImage("resources/img/Characters/Ships/ship2Red.png");
							ship.image = "resources/img/Characters/Ships/ship2Red.png";
						break;
						case 2:
							this.setImage("resources/img/Characters/Ships/ship3Red.png");
							ship.image = "resources/img/Characters/Ships/ship3Red.png";
						break;
						default:
							if(index > 2)
							{
								index = 0;
								this.setImage("resources/img/Characters/Ships/ship1Red.png");
								ship.image = "resources/img/Characters/Ships/ship1Red.png";
							}
							if(index < 0)
							{
								index = 2;
								this.setImage("resources/img/Characters/Ships/ship3Red.png");
								ship.image = "resources/img/Characters/Ships/ship3Red.png";
							}
						break;
					}
				break;
				case 3: // Yellow
					switch(index)
					{
						case 0:
							this.setImage("resources/img/Characters/Ships/ship1Yellow.png");
							ship.image = "resources/img/Characters/Ships/ship1Yellow.png";
						break;
						case 1:
							this.setImage("resources/img/Characters/Ships/ship2Yellow.png");
							ship.image = "resources/img/Characters/Ships/ship2Yellow.png";
						break;
						case 2:
							this.setImage("resources/img/Characters/Ships/ship3Yellow.png");
							ship.image = "resources/img/Characters/Ships/ship3Yellow.png";
						break;
						default:
							if(index > 2)
							{
								index = 0;
								this.setImage("resources/img/Characters/Ships/ship1Yellow.png");
								ship.image = "resources/img/Characters/Ships/ship1Yellow.png";
							}
							if(index < 0)
							{
								index = 2;
								this.setImage("resources/img/Characters/Ships/ship3Yellow.png");
								ship.image = "resources/img/Characters/Ships/ship3Yellow.png";
							}
						break;
					}
				break;
				default:
					if(color > 3)
					{
						color = 0;
						this.switchShip();
					}
					if(color < 0)
					{
						color = 3;
						this.switchShip();
					}
				break;
			}
		}
	}
	SelectedShip.prototype = scorch.Entity.prototype;
}