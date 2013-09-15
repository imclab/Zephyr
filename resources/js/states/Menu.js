function menuState()
{
	var playButton;
	var optionsButton;
	var creditsButton;
	var cursor;

	this.Init = function()
	{
		cursor = new scorch.Entity({x: scorch.mouse_x,
									y: scorch.mouse_y,
									anchor: "center",
									image: "resources/img/UI/Reticle.png"
								});

		startButton = new Button({x: scorch.width / 2,
								  y: scorch.height / 2,
								  text: "Play",
								  action: function(){scorch.switchGameState(characterSelect);},
								  anchor: "center"
								});

		optionsButton = new Button({x: scorch.width / 2,
								  y: (scorch.height / 2) + 75,
								  text: "Options",
								  action: function(){scorch.switchGameState(optionsState);},
								  anchor: "center"
								});

		creditsButton = new Button({x: scorch.width / 2,
								  y: (scorch.height / 2) + 150,
								  text: "Credits",
								  action: function(){scorch.switchGameState(creditsState);},
								  anchor: "center"
								});
	}

	this.Update = function()
	{
		cursor.x = scorch.mouse_x;
		cursor.y = scorch.mouse_y;
		startButton.update();
		optionsButton.update();
		creditsButton.update();
	}

	this.Draw = function()
	{
		scorch.clear();
		
		scorch.context.font = "bold 30pt terminal";
		scorch.context.textAlign = "center";
		scorch.context.textBaseline = "middle";
		scorch.context.fillStyle = "Black";
		scorch.context.fillText("Zephyr", scorch.canvas.width / 2, scorch.canvas.height / 2 - 150);

		startButton.draw();
		optionsButton.draw();
		creditsButton.draw();
		cursor.draw();
	}
}