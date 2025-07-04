
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var play = false; 

	document.getElementById("play").addEventListener("click", function () {
	
		// Display main message
		document.getElementById("play").style.display = "none";
		document.getElementById("message").style.display = "none";

		let parameter = {
			score:0,
			live:3,
			level:1,
			skills:0.00,
		}

		function dom(dom, init){
			document.getElementById(dom).textContent = init
		}
		
		dom("score", parameter.score)
		dom("live", parameter.live)
		dom("level", parameter.level)
		dom("skills", parameter.skills)
		
		//sound effect

		var sound = {
			fireGun:new Audio('sons/shoot.wav'),
			explosion:new Audio('sons/explosion.wav'),
			shock:new Audio('sons/shock.wav'),
			newLevel:new Audio('sons/level.mp3'),
			speed:new Audio('sons/speed.ogg'),
			round_1:new Audio('sons/round_1.mp3'),
			round_2:new Audio('sons/round_2.mp3'),
			round_3:new Audio('sons/round_3.mp3'),
			round_4:new Audio('sons/round_4.mp3'),
			round_5:new Audio('sons/round_5.mp3'),
			round_6:new Audio('sons/battleMode.mp3'),
			kill_it:new Audio('sons/kill_it.mp3'),
			domages:new Audio("sons/domages.mp3"),
			loser:new Audio("sons/loser.mp3"),
		}

		let paraShip = {
			X:300,
			Y:0,
			velocityX:0, // Vitesse actuelle sur l'axe X
			velocityY:0, // Vitesse actuelle sur l'axe Y
			acceleration: 0.5, // Valeur d'accélération
			friction: 0.95, // Valeur de friction (plus proche de 1 = moins de friction)
			maxSpeed: 7, // Vitesse maximale
			up:false,
			down:false,
			right:false,
			left:false,
			live:22,
			shootGun:false
		}
		let badBoy = {
			X:300,
			Y:0,
			health: 100, // Ajout de la propriété health
			color:['', 'yellow', 'orange', 'red'], // Couleurs pour différents niveaux/états
			moveX:0,
			moveY:0,
			speedX:3,
			speedY:2,
			switchDirectionX:true,
			switchDirectionY:true
		}
		let paraGun = {
			X:[],
			Y:[],
			limit:685,
			fire:false,
			step:3,
		}
		
		let impactArea = {
			zone:0
		}
		
		function shootingArea(valuX, valuY){
			if(paraGun.X.length < 1){
				paraGun.X.push(valuX)
				paraGun.Y.push(valuY)
				sound.fireGun.play();
				paraGun.fire = true
			}
		}
		
		
		
		//////////////////////////////////////////////////////////////////
		function globalLoop(){
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			
			// Appliquer l'accélération
			if (paraShip.left) {
				paraShip.velocityX -= paraShip.acceleration;
			}
			if (paraShip.right) {
				paraShip.velocityX += paraShip.acceleration;
			}
			if (paraShip.up) {
				paraShip.velocityY -= paraShip.acceleration;
			}
			if (paraShip.down) {
				paraShip.velocityY += paraShip.acceleration;
			}

			// Appliquer la friction
			paraShip.velocityX *= paraShip.friction;
			paraShip.velocityY *= paraShip.friction;

			// Limiter la vitesse
			if (paraShip.velocityX > paraShip.maxSpeed) {
				paraShip.velocityX = paraShip.maxSpeed;
			}
			if (paraShip.velocityX < -paraShip.maxSpeed) {
				paraShip.velocityX = -paraShip.maxSpeed;
			}
			if (paraShip.velocityY > paraShip.maxSpeed) {
				paraShip.velocityY = paraShip.maxSpeed;
			}
			if (paraShip.velocityY < -paraShip.maxSpeed) {
				paraShip.velocityY = -paraShip.maxSpeed;
			}

			// Mettre à jour la position
			paraShip.X += paraShip.velocityX;
			paraShip.Y += paraShip.velocityY;

			// Garder le vaisseau dans les limites du canvas
			if (paraShip.X < 5) {
				paraShip.X = 5;
				paraShip.velocityX = 0;
			}
			if (paraShip.X > 560) {
				paraShip.X = 560;
				paraShip.velocityX = 0;
			}
			if (paraShip.Y < -300) {
				paraShip.Y = -300;
				paraShip.velocityY = 0;
			}
			if (paraShip.Y > -5) {
				paraShip.Y = -5;
				paraShip.velocityY = 0;
			}
			
			ctx.beginPath();
			ctx.fillStyle = "white";
			ctx.fillRect(paraShip.X + 11, paraShip.Y + 685, 5, 5);
			ctx.fillRect(paraShip.X + 8, paraShip.Y + 695, 12, 5);
			
			ctx.fillStyle = "white";
			ctx.fillRect(paraShip.X + 0, paraShip.Y + 690, 30, 10);
			ctx.fillStyle = "red"
			ctx.fillRect(paraShip.X + 4, paraShip.Y + 693, paraShip.live, 5);
			

			
			if(badBoy.switchDirectionX){
				badBoy.moveX+=badBoy.speedX
				badBoy.moveX <= 560 ? badBoy.switchDirectionX = true:badBoy.switchDirectionX = false
			}
			else if (!badBoy.switchDirectionX){
				badBoy.moveX-=badBoy.speedX
				badBoy.moveX >= 0 ? badBoy.switchDirectionX = false:badBoy.switchDirectionX = true
			}

			if(badBoy.switchDirectionY){
				badBoy.moveY+=badBoy.speedY
				badBoy.moveY <= 200 ? badBoy.switchDirectionY = true:badBoy.switchDirectionY = false
			}
			else if (!badBoy.switchDirectionY){
				badBoy.moveY-=badBoy.speedY
				badBoy.moveY >= 0 ? badBoy.switchDirectionY = false:badBoy.switchDirectionY = true
			}

			//BadBoy
			ctx.beginPath();
			ctx.fillStyle = badBoy.color[parameter.level];
			ctx.fillRect(0 + badBoy.moveX, 6 + badBoy.moveY, 30, 10);
			ctx.fillRect(4 + badBoy.moveX, 3 + badBoy.moveY, 4, 3);
			ctx.fillRect(20 + badBoy.moveX, 0 + badBoy.moveY, 1, 6);
			ctx.fillRect(12 + badBoy.moveX, 16 + badBoy.moveY, 4, 3);
			ctx.fillStyle = "red";
			ctx.fillRect(2 + badBoy.moveX, 10 + badBoy.moveY, 25, 3);
			
			


			




			paraShip.shootGun ? shootingArea(paraShip.X, paraShip.Y):''

			if(paraGun.fire){
				paraGun.step+=10
				ctx.beginPath()
				ctx.fillStyle = "yellow"
				ctx.fillRect(
							paraGun.X[0]+13,
							paraGun.limit-paraGun.step+paraGun.Y[0],
							2,
							5
							)
				if((paraGun.step-paraGun.Y[0]) > paraGun.limit){
					paraGun.step=0,
					paraGun.X=[],
					paraGun.Y=[],
					paraGun.fire = false,
					paraShip.shootGun= false
				}
				else{
					// Détection de collision entre le tir et l'ennemi
					let bulletX = paraGun.X[0] + 13;
					let bulletY = paraGun.limit - paraGun.step + paraGun.Y[0];
					let enemyX = badBoy.moveX;
					let enemyY = badBoy.moveY;
					let enemyWidth = 30;
					let enemyHeight = 16; // Hauteur approximative de l'ennemi

					if (bulletX > enemyX && bulletX < enemyX + enemyWidth &&
						bulletY > enemyY && bulletY < enemyY + enemyHeight) {

						sound.domages.play();
						badBoy.health -= 25; // Réduire la vie de l'ennemi
						paraGun.step = 0; // Réinitialiser le tir pour qu'il disparaisse
						paraGun.X = [];
						paraGun.Y = [];
						paraGun.fire = false;
						paraShip.shootGun = false;

						if (badBoy.health <= 0) {
							sound.explosion.play();
							parameter.score += 100; // Augmenter le score
							dom("score", parameter.score);

							// Augmentation de niveau tous les 500 points (par exemple)
							if (parameter.score % 500 === 0 && parameter.score > 0) {
								parameter.level++;
								dom("level", parameter.level);
								sound.newLevel.play();
								// Augmenter la difficulté
								badBoy.speedX += 0.5;
								badBoy.speedY += 0.2;
								badBoy.health = 100 + (parameter.level -1) * 20; // Augmenter la vie de l'ennemi avec le niveau

								// Changer la couleur de l'ennemi en fonction du niveau
								if(parameter.level < badBoy.color.length){
									ctx.fillStyle = badBoy.color[parameter.level];
								} else {
									ctx.fillStyle = badBoy.color[badBoy.color.length -1]; // Utiliser la dernière couleur si le niveau dépasse
								}

								// Jouer le son correspondant au round/niveau
								if (parameter.level === 2) sound.round_2.play();
								else if (parameter.level === 3) sound.round_3.play();
								else if (parameter.level === 4) sound.round_4.play();
								else if (parameter.level === 5) sound.round_5.play();
								else if (parameter.level >= 6) sound.round_6.play();


							}

							// Réinitialiser l'ennemi
							badBoy.X = Math.random() * (canvas.width - 30);
							badBoy.Y = Math.random() * 100;
							badBoy.health = 100 + (parameter.level -1) * 20; // S'assurer que la vie est réinitialisée correctement
						}
					}
				}
			}

			// Afficher la barre de vie de l'ennemi
			ctx.fillStyle = "green";
			ctx.fillRect(badBoy.moveX, badBoy.moveY - 10, (badBoy.health / (100 + (parameter.level -1) * 20)) * 30, 5);


			loop_globalLoop = window.requestAnimationFrame(globalLoop);
			
		}
		globalLoop();

		
		//////////////////////////////////////////////////////////////////
		
		// Push button 
		function yesMove(touche) {
			touche.keyCode == 32 ? paraShip.shootGun = true : ''
			touche.keyCode == 37 ? paraShip.left = true :''
			touche.keyCode == 39 ? paraShip.right = true :''
			touche.keyCode == 38 ? paraShip.up = true :''
			touche.keyCode == 40 ? paraShip.down = true :''
		}

		
		function stopMove(touche) {
			// touche.keyCode == 32 ? paraShip.shootGun = false : ''
			touche.keyCode == 37 ? paraShip.left = false :''
			touche.keyCode == 39 ? paraShip.right = false :''
			touche.keyCode == 38 ? paraShip.up = false :''
			touche.keyCode == 40 ? paraShip.down = false :''
		};

		// Ecoute du keybord
		document.addEventListener('keydown', yesMove);
		document.addEventListener('keyup', stopMove);
})