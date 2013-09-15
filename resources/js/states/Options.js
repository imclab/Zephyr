function optionsState()
{
	// Audio
		// Master
		// Music
		// Effects
	// Graphics
		// Particles
		// Texture Quality
		// Vsync
		// Brightness
	// Gameplay
		// Difficulty
		// Hotkeys

	var cursor;
	var audioButton;
	var graphicsButton;
	var gameplayButton;
	var backButton;

	this.Init = function()
	{
		cursor = new scorch.Entity({x: scorch.mouse_x,
									y: scorch.mouse_y,
									anchor: "center",
									image: "resources/img/UI/Reticle.png"
								});

		audioButton = new Button({x: scorch.width / 2,
								  y: scorch.height / 2 - 75,
								  text: "Audio",
								  action: function(){},
								  anchor: "center"
								});

		graphicsButton = new Button({x: scorch.width / 2,
								  y: scorch.height / 2,
								  text: "Graphics",
								  action: function(){},
								  anchor: "center"
								});

		gameplayButton = new Button({x: scorch.width / 2,
								  y: scorch.height / 2 + 75,
								  text: "Gameplay",
								  action: function(){},
								  anchor: "center"
								});

		backButton = new Button({x: scorch.width / 2,
								  y: scorch.height / 2 + 150,
								  text: "Back",
								  action: function(){scorch.switchGameState(menuState);},
								  anchor: "center"
								});
	}

	this.Update = function()
	{
		cursor.x = scorch.mouse_x;
		cursor.y = scorch.mouse_y;

		audioButton.update();
		graphicsButton.update();
		gameplayButton.update();
		backButton.update();
	}

	this.Draw = function()
	{
		// Clear screen
		scorch.clear();

		audioButton.draw();
		graphicsButton.draw();
		gameplayButton.draw();
		backButton.draw();

		cursor.draw();
	}
}