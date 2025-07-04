
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var play = false; 

	document.getElementById("play").addEventListener("click", function () {
		// Si le jeu redémarre, s'assurer que les écouteurs d'événements sont bien actifs
		document.addEventListener('keydown', yesMove);
		document.addEventListener('keyup', stopMove);
	
		// Display main message
		document.getElementById("play").style.display = "none";
		document.getElementById("message").style.display = "none";

		let parameter = {
			score:0,
			live:3, // Correspond aux 3 vies affichées dans l'UI
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
			switchDirectionY:true,
			lastDirectionChange: 0, // Timestamp du dernier changement de direction aléatoire
			randomMoveInterval: 2000, // Intervalle en ms pour les mouvements aléatoires (toutes les 2 secondes)
			canShoot: true,
			shootCooldown: 1500, // Temps en ms avant que l'ennemi puisse tirer à nouveau
			lastShotTime: 0
		}

		let enemyGun = {
			X:[],
			Y:[],
			limit: 700, // Limite de la portée du tir ennemi (bas du canvas)
			fire:false,
			step:0, // Initialiser step à 0 pour le tir ennemi
			speed: 5 // Vitesse du tir ennemi
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
			
			// Logique de mouvement aléatoire pour l'ennemi
			let currentTime = Date.now();
			if (currentTime - badBoy.lastDirectionChange > badBoy.randomMoveInterval) {
				// Changer de direction de manière plus aléatoire
				if (Math.random() < 0.3) { // 30% de chance de changer de direction X
					badBoy.switchDirectionX = !badBoy.switchDirectionX;
				}
				if (Math.random() < 0.3) { // 30% de chance de changer de direction Y
					badBoy.switchDirectionY = !badBoy.switchDirectionY;
				}
				// Vitesse légèrement aléatoire
				badBoy.speedX = 2 + Math.random() * 2 + (parameter.level -1) * 0.5; // Vitesse X entre 2 et 4, + bonus de niveau
				badBoy.speedY = 1 + Math.random() * 1.5 + (parameter.level -1) * 0.2; // Vitesse Y entre 1 et 2.5, + bonus de niveau

				badBoy.lastDirectionChange = currentTime;
			}

			// Logique de tir de l'ennemi
			let enemyCurrentTime = Date.now();
			if (badBoy.canShoot && enemyCurrentTime - badBoy.lastShotTime > badBoy.shootCooldown) {
				if (enemyGun.X.length < 1) { // Permettre à l'ennemi de tirer seulement s'il n'y a pas déjà un tir actif
					enemyGun.X.push(badBoy.moveX + 13); // Position X du tir ennemi (centre de l'ennemi)
					enemyGun.Y.push(badBoy.moveY + 20); // Position Y du tir ennemi (sous l'ennemi)
					enemyGun.fire = true;
					badBoy.lastShotTime = enemyCurrentTime;
					// sound.enemyFireGun.play(); // Ajouter un son pour le tir ennemi si disponible
				}
			}

			if (enemyGun.fire) {
				enemyGun.step += enemyGun.speed;
				ctx.beginPath();
				ctx.fillStyle = "orange"; // Couleur du tir ennemi
				ctx.fillRect(
					enemyGun.X[0],
					enemyGun.Y[0] + enemyGun.step,
					2,
					5
				);

				// Collision du tir ennemi avec le joueur
				let enemyBulletX = enemyGun.X[0];
				let enemyBulletY = enemyGun.Y[0] + enemyGun.step;
				let playerHitboxX = paraShip.X;
				let playerHitboxY = paraShip.Y + 690; // Y ajusté pour la base du vaisseau joueur
				let playerHitboxWidth = 30;
				let playerHitboxHeight = 10;

				if (enemyBulletX > playerHitboxX && enemyBulletX < playerHitboxX + playerHitboxWidth &&
					enemyBulletY > playerHitboxY && enemyBulletY < playerHitboxY + playerHitboxHeight) {

					sound.shock.play(); // Son de dégât sur le joueur
					paraShip.live -= 5; // Réduire la vie du joueur (valeur à ajuster)
					dom("live", Math.max(0, Math.ceil(paraShip.live / (22/3)))); // Mettre à jour l'affichage des vies (supposant que 22 = 3 vies UI)

					enemyGun.step = 0; // Réinitialiser le tir ennemi
					enemyGun.X = [];
					enemyGun.Y = [];
					enemyGun.fire = false;

					if (paraShip.live <= 0) {
						sound.loser.play();
						// Afficher le message de fin de partie
						document.getElementById("message").textContent = "GAME OVER! Score: " + parameter.score;
						document.getElementById("message").style.display = "block";
						document.getElementById("play").textContent = "Rejouer?";
						document.getElementById("play").style.display = "block";
						window.cancelAnimationFrame(loop_globalLoop); // Arrêter la boucle de jeu
						document.removeEventListener('keydown', yesMove); // Désactiver les mouvements
						document.removeEventListener('keyup', stopMove);  // Désactiver les mouvements
						return; // Sortir de la boucle pour éviter d'autres exécutions
					}
				}


				if (enemyGun.Y[0] + enemyGun.step > enemyGun.limit) {
					enemyGun.step = 0;
					enemyGun.X = [];
					enemyGun.Y = [];
					enemyGun.fire = false;
				}
			}


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