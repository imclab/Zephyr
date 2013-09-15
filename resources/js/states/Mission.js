function missionState()
{
	var lighting = new scorch.Lighting();
	var light;
	var player;
	var paused = false;
	var inventory = false;
	var parallax = new scorch.Parallax();
	var playerBullets = new scorch.EntityList({alwaysActive: false}); // Use alwaysActive: false to remove entities once they are offscreen set to true if you would like them to be persistent offscreen
	var playerBeams = new scorch.EntityList({alwaysActive: true});
	var enemyBullets = new scorch.EntityList({alwaysActive: false});
	var enemies = new scorch.EntityList({alwaysActive: false});

	var particleEmitters = [];

	this.Init = function()
	{
		// Lighting
		light = new scorch.Light({red: 255, green: 0, blue: 0, alpha: 128});
		lighting.add(light);

		// Input
		scorch.preventDefaultKeys(["w","a","s","d","b","space"]);

		// Background
		var background = new scorch.ParallaxLayer({speed: 1, layer: "background"});
			background.add(new scorch.Background({image: "resources/img/Backgrounds/Space_Parallax_Background_00.png", x: 0, y: 0, alpha: 1}));
			background.add(new scorch.Background({image: "resources/img/Backgrounds/Space_Parallax_Background_01.png", x: 0, y: -600, alpha: 1}));

		var foreground = new scorch.ParallaxLayer({speed: 1.75, layer: "foreground"});
			foreground.add(new scorch.Background({image: "resources/img/Backgrounds/Nebula_Parallax_Foreground_00.png", x: 0, y: 0, alpha: 1}));
			foreground.add(new scorch.Background({image: "resources/img/Backgrounds/Nebula_Parallax_Foreground_01.png", x: 0, y: 0, alpha: 1}));

		parallax.add(background);
		parallax.add(foreground);

		// Enemies
		enemies.push(new Enemy({image: "resources/img/Characters/Enemy_Idle.png",
								anchor: "center",
								x: 400,
								y: 100,
								canFire: true,
								life: 3
							}));

		player = new Player({x: 400,
							 y: 550,
							 image: ship.image,
							 anchor: "center",
							 mirrored: "horizontal",
							 speed: 2,
							 canFire: true,
							 maxLife: 10,
							 maxShield: 10,
							 maxEnergy: 100
							});
	}

	this.Update = function()
	{
		if(scorch.pressedWithoutRepeat("esc p")) { paused = !paused; }
		if(scorch.pressedWithoutRepeat("i")) { inventory = !inventory; }

		if(inventory)
		{ paused = !paused; }
		
		if(!paused)
		{
			// Lighting
			//lighting.update();

			// Background
			parallax.update();

			// Player
			player.update();
			playerBullets.update();
			playerBeams.update();

			// Enemies
			enemies.update();
			enemyBullets.update();

			// Collision Detection
			playerBullets.forEach(function(bullet)
			{
				enemies.forEach(function(enemy)
				{
					if(scorch.collideOneWithOne(bullet, enemy))
					{
						playerBullets.kill(bullet);
						enemy.takeDamage(bullet.damage);
					}
				});
			});
			playerBeams.forEach(function(beam)
			{
				enemies.forEach(function(enemy)
				{
					if(scorch.collideOneWithOne(beam, enemy))
					{
						enemy.takeDamage(beam.damage);
					}
				});
			});

			enemyBullets.forEach(function(bullet)
			{
				if(scorch.collideOneWithOne(bullet, player))
				{
					enemyBullets.kill(bullet);
					player.takeDamage(bullet.damage);
				}
			});

			// Particles
			for(var i = 0; i < particleEmitters.length; i++)
			{
				particleEmitters[i].update();
				if(!particleEmitters[i].isAlive)
				{
					particleEmitters = scorch.popArray(particleEmitters, i);
				}
			}
		}
	}

	this.Draw = function()
	{
		// Clear screen
		scorch.clear();

		// Background
		parallax.draw("background");

		// Player
		player.draw();
		playerBullets.draw();
		playerBeams.draw();

		// Enemies
		enemies.draw();
		enemyBullets.draw();

		// Particles
		for(var i = 0; i < particleEmitters.length; i++)
		{
			particleEmitters[i].draw();
		}

		// Foreground
		parallax.draw("foreground");

		// Lighting
		lighting.draw();

		// HUD
		/* Shield */
		scorch.context.beginPath();
		scorch.context.rect(5, scorch.canvas.height - 51, 100, 12);
		scorch.context.fillStyle = 'black';
		scorch.context.fill();

		scorch.context.beginPath();
		scorch.context.rect(5, scorch.canvas.height - 51, 100 / (player.maxShield / player.shield), 12);
		scorch.context.fillStyle = 'blue';
		scorch.context.fill();

		/* Lifebar */
		scorch.context.beginPath();
		scorch.context.rect(5, scorch.canvas.height - 34, 100, 12);
		scorch.context.fillStyle = 'red';
		scorch.context.fill();

		scorch.context.beginPath();
		scorch.context.rect(5, scorch.canvas.height - 34, 100 / (player.maxLife / player.life), 12);
		scorch.context.fillStyle = 'green';
		scorch.context.fill();
		
		/* Energy */
		scorch.context.beginPath();
		scorch.context.rect(5, scorch.canvas.height - 17, 100, 12);
		scorch.context.fillStyle = 'black';
		scorch.context.fill();

		scorch.context.beginPath();
		scorch.context.rect(5, scorch.canvas.height - 17, 100 / (player.maxEnergy / player.energy), 12);
		scorch.context.fillStyle = "rgb(82, 20, 191)";
		scorch.context.fill();

		// Cursor
		player.cursor.draw();
	}

	function Player(options)
	{
		// Player Cursor
		this.cursor = new scorch.Entity({x: scorch.mouse_x,
										y: scorch.mouse_y,
										anchor: "center",
										image: "resources/img/UI/Reticle.png"
									});
		this.canFirePrimary = options.canFire;
		this.canFireSecondary = options.canFire;
		this.canFirePassive = options.canFire;

		this.image = options.image;

		// Stats
		this.speed = options.speed;
		this.maxLife = options.maxLife;
		this.life = this.maxLife;
		this.maxShield = options.maxShield;
		this.shield = this.maxShield;
		this.maxEnergy = options.maxEnergy;
		this.energy = this.maxEnergy;


		// Equipment
		this.primaryWeapon = options.primaryWeapon || 0;
		this.secondaryWeapon = options.secondaryWeapon || 0;
		this.passiveWeapon = options.passiveWeapon || 0;
		this.activeDefense = options.activeDefense || 0;
		this.passiveDefense = options.passiveDefense || 0;
		this.thruster = options.thruster || 0;
		this.sideThruster = options.sideThruster || 0;
		this.generator = options.generator || 0;
		this.capacitor = options.capacitor || 0;
		this.sensor = options.sensor || 0;
		this.tractorBeam = options.tractorBeam || 0;
		this.cargoBay = options.cargoBay || 0;
		this.engineCoolant = options.engineCoolant || 0;
		this.timeAccelerationDrive = options.timeAccelerationDrive || 0;

		scorch.Entity.call(this, options);

		/*
		var anim = new scorch.Animation({entity_frame: options.image, frame_size: [24, 50], frame_duration: 75});
		this.anim_default = anim.slice(0, 4);
		this.anim_up = anim.slice(0, 4);
		this.anim_down = anim.slice(0, 4);
		this.anim_left = anim.slice(0, 4);
		this.anim_right = anim.slice(0, 4);
		this.setImage(this.anim_default.next());
		*/

		this.update = function()
		{
			// Cursor Position
			this.cursor.x = scorch.mouse_x;
			this.cursor.y = scorch.mouse_y;

			// Update sprite
			//this.setImage(this.anim_default.next());

			// Input
			if(scorch.pressed("left a")) { player.x -= player.speed; }//player.setImage(player.anim_left.next()); }
			if(scorch.pressed("right d")) { player.x += player.speed; }//player.setImage(player.anim_right.next()); }
			if(scorch.pressed("up w"))
			{
				player.y -= player.speed;
				//player.setImage(player.anim_up.next());
				particleEmitters.push(new scorch.Emitter({x: player.x, y: player.y + (player.height / 2), vx: 0, vy: 0, frequency: 1, age: 1, type: "Exhaust"}));
			}
			if(scorch.pressed("down s"))
				{ player.y += player.speed; }//player.setImage(player.anim_down.next()); }

			if(scorch.pressed("space left_mouse_button"))
			{
				if(player.canFirePrimary)
				{
					switch(this.primaryWeapon)
					{
						case 0:
							playerBullets.push(new Bullet({damage: 1, image: "resources/img/Weapons/Player_Bullet.png", anchor: "center", x: player.x, y: player.rect().y, vx: this.cursor.x, vy: this.cursor.y}));
							setTimeout(function(){player.canFirePrimary = true}, 1000 / 5/*Shots per second*/);
						break;
						case 1:
							playerBullets.push(new Bullet({damage: 2, image: "resources/img/Weapons/Player_Bullet.png", anchor: "center", x: player.x, y: player.rect().y, vx: this.cursor.x, vy: this.cursor.y}));
							setTimeout(function(){player.canFirePrimary = true}, 1000 / 10/*Shots per second*/);
						break;
						default:
							console.log("Error: Invalid Primary Weapon!");
						break;
					}
					player.canFirePrimary = false;
				}
			}

			if(scorch.pressed("b right_mouse_button"))
			{
				if(this.energy > 0)
				{
					if(player.canFireSecondary)
					{
						switch(this.secondaryWeapon)
						{
							case 0:
								if(playerBeams.length == 0)
								{
									playerBeams.push(new Beam({damage: 0.1, image: "resources/img/Weapons/Player_Beam.png", anchor: "bottom_center", x: player.x, y: player.rect().y, vx: player.x, vy: 500}));
								}
								particleEmitters.push(new scorch.Emitter({x: player.x, y: player.y - (player.height / 2), vx: 0, vy: 0, frequency: 1, age: 1, type: "Beam_Green", endY: -1}));
								this.useEnergy(1);
							break;
							case 1:
								if(playerBeams.length == 0)
								{
									playerBeams.push(new Beam({damage: 0.1, image: "resources/img/Weapons/Player_Beam.png", anchor: "bottom_center", x: player.x, y: player.rect().y, vx: player.x, vy: 500}));
								}
								particleEmitters.push(new scorch.Emitter({x: player.x, y: player.y - (player.height / 2), vx: 0, vy: 0, frequency: 1, age: 1, type: "Beam_Red", endY: -1}));
								this.useEnergy(1);
							break;
							case 2:
								if(playerBeams.length == 0)
								{
									playerBeams.push(new Beam({damage: 0.1, image: "resources/img/Weapons/Player_Beam.png", anchor: "bottom_center", x: player.x, y: player.rect().y, vx: player.x, vy: 500}));
								}
								particleEmitters.push(new scorch.Emitter({x: player.x, y: player.y - (player.height / 2), vx: 0, vy: 0, frequency: 1, age: 1, type: "Beam_Blue", endY: -1}));
								this.useEnergy(1);
							break;
							default:
								console.log("Error: Invalid Secondary Weapon!");
							break;
						}
					}
				}
			}
			else
			{
				playerBeams.forEach(function(beam)
				{
					playerBeams.kill(beam);
				});
			}

			if(player.canFirePassive)
			{
				var nearestEnemy = findNearestEnemy();
				if(nearestEnemy != null)
				{
					switch(this.passiveWeapon)
					{
						case 0:
							playerBullets.push(new Bullet({damage: 0.25, image: "resources/img/Weapons/Player_Bullet.png", anchor: "center", x: player.x, y: player.rect().y, vx: nearestEnemy.x, vy: nearestEnemy.y}));
							setTimeout(function(){player.canFirePassive = true}, 1000 / 2/*Shots per second*/);
						break;
						case 1:
						break;
						default:
						break;
					}
					player.canFirePassive = false;
				}
			}
		}

		this.useEnergy = function(amount)
		{
			this.energy -= amount;
			if(this.energy < 0)
			{
				this.energy = 0;
			}
		}

		this.takeDamage = function(damage)
		{
			if(this.shield > 0)
			{
				if(this.shield < damage)
				{
					this.life -= damage - shield;
					this.shield = 0;
				}
				else
				{
					this.shield -= damage;
				}
			}
			else
			{
				this.life -= damage;
			}
			if(this.life <= 0)
			{
				this.life = 0;
				//function(){scorch.switchGameState(gameOverState);}
			}
		}

		function findNearestEnemy()
		{
			var min = 10000;
			var closest = null;
			enemies.forEach(function(enemy)
			{
				var dist = scorch.distanceBetween(player, enemy);
				if(min > dist)
				{
					min = dist;
					closest = enemy;
				}
			});
			return closest;
		}

		this.changePrimaryWeapon = function(itemNum)
		{
			this.primaryWeapon = itemNum;
		}

		this.changeSecondaryWeapon = function(itemNum)
		{
			this.secondaryWeapon = itemNum;
		}

		this.changePassiveWeapon = function(itemNum)
		{
			this.passiveWeapon = itemNum;
		}

		this.changeActiveDefense = function(itemNum)
		{
			this.activeDefense = itemNum;
			switch(this.activeDefense)
			{
				case 0:
				break;
				case 1:
				break;
				default:
				break;
			}
		}

		this.changePassiveDefense = function(itemNum)
		{
			this.passiveDefense = itemNum;
			switch(this.passiveDefense)
			{
				case 0:
				break;
				case 1:
				break;
				default:
				break;
			}
		}

		this.changeThruster = function(itemNum)
		{
			this.thruster = itemNum;
			switch(this.thruster)
			{
				case 0:
				break;
				case 1:
				break;
				default:
				break;
			}
		}

		this.changeSideThruster = function(itemNum)
		{
			this.sideThruster = itemNum;
			switch(this.sideThruster)
			{
				case 0:
				break;
				case 1:
				break;
				default:
				break;
			}
		}

		this.changeGenerator = function(itemNum)
		{
			this.generator = itemNum;
			switch(this.generator)
			{
				case 0:
				break;
				case 1:
				break;
				default:
				break;
			}
		}

		this.changeCapacitor = function(itemNum)
		{
			this.capacitor = itemNum;
			switch(this.capacitor)
			{
				case 0:
				break;
				case 1:
				break;
				default:
				break;
			}
		}

		this.changeSensor = function(itemNum)
		{
			this.sensor = itemNum;
			switch(this.sensor)
			{
				case 0:
				break;
				case 1:
				break;
				default:
				break;
			}
		}

		this.changeTractorBeam = function(itemNum)
		{
			this.tractorBeam = itemNum;
			switch(this.tractorBeam)
			{
				case 0:
				break;
				case 1:
				break;
				default:
				break;
			}
		}

		this.changeCargoBay = function(itemNum)
		{
			this.cargoBay = itemNum;
			switch(this.cargoBay)
			{
				case 0:
				break;
				case 1:
				break;
				default:
				break;
			}
		}

		this.changeEngineCoolant = function(itemNum)
		{
			this.engineCoolant = itemNum;
			switch(this.engineCoolant)
			{
				case 0:
				break;
				case 1:
				break;
				default:
				break;
			}
		}

		this.changeTimeAccelerationDrive = function(itemNum)
		{
			this.timeAccelerationDrive = itemNum;
			switch(this.timeAccelerationDrive)
			{
				case 0:
				break;
				case 1:
				break;
				default:
				break;
			}
		}
	}
	Player.prototype = scorch.Entity.prototype;

	function Bullet(options)
	{
		this.start = new scorch.Vec2({x: options.x, y: options.y});
		this.end = new scorch.Vec2({x: options.vx, y: options.vy});
		options.angle = (90 + scorch.angleDegrees(this.start, this.end));
		this.angleTo = options.angle * Math.PI / 180;
		this.speed = options.speed || 3;
		this.damage = options.damage || 1;

		scorch.Entity.call(this, options);

		var anim = new scorch.Animation({entity_frame: options.image, frame_size: [8, 16], frame_duration: 75});
		this.anim_default = anim.slice(0, 11);
		this.setImage(this.anim_default.next());

		this.update = function()
		{
			this.x += Math.sin(this.angleTo) * this.speed;
			this.y += -Math.cos(this.angleTo) * this.speed;
			this.setImage(this.anim_default.next());
		}

		this.kill = function()
		{
			particleEmitters.push(new scorch.Emitter({x: this.x, y: this.y, vx: 0, vy: 0, frequency: 2, age: 18, type: "Spark_Green"}));
		}
	}
	Bullet.prototype = scorch.Entity.prototype;

	function Beam(options)
	{
		this.start = new scorch.Vec2({x: options.x, y: options.y});
		this.end = new scorch.Vec2({x: options.vx, y: options.vy});
		this.damage = options.damage || 0.1;

		scorch.Entity.call(this, options);

		this.update = function()
		{
			this.x = player.x;
			this.y = player.y;
		}

		this.kill = function()
		{
			
		}
	}
	Beam.prototype = scorch.Entity.prototype;

	function Enemy(options)
	{
		this.canFire = options.canFire;
		this.damage = options.damage || 1;
		this.maxLife = options.life || 1;
		this.life = options.life || 1;
		this.speed = options.speed || 5;

		scorch.Entity.call(this, options);

		var anim = new scorch.Animation({entity_frame: options.image, frame_size: [23, 64], frame_duration: 75});
		this.anim_default = anim.slice(0, 4);
		this.setImage(this.anim_default.next());

		this.update = function()
		{
			this.setImage(this.anim_default.next());
			if(options.canFire)
			{
				enemyBullets.push(new Bullet({damage: 1, speed: 3, image: "resources/img/Weapons/Enemy_Bullet.png", anchor: "center", x: this.x, y: this.y + 30, vx: player.x, vy: player.y}));
				setTimeout(function(){options.canFire = true}, 1000 / 2/*Shots per second*/);
				options.canFire = false;
			}
		}

		this.kill = function()
		{
			particleEmitters.push(new scorch.Emitter({x: this.x, y: this.y, vx: 0, vy: 0, frequency: 2, age: 18, type: "Explosion"}));
			particleEmitters.push(new scorch.Emitter({x: this.x, y: this.y, vx: 0, vy: 0, frequency: 2, age: 18, type: "Explosion"}));
			particleEmitters.push(new scorch.Emitter({x: this.x, y: this.y, vx: 0, vy: 0, frequency: 2, age: 18, type: "Explosion"}));
		}

		this.takeDamage = function(damage)
		{
			this.life -= damage;
			if(this.life <= 0)
			{
				enemies.kill(this);
			}
		}
	}
	Enemy.prototype = scorch.Entity.prototype;
}