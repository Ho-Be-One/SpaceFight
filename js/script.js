
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var play = false; 
	var loop_globalLoop = null; // Déclaration de loop_globalLoop dans une portée plus large

	document.getElementById("play").addEventListener("click", function () {
		// Si le jeu redémarre, s'assurer que les écouteurs d'événements sont bien actifs
		document.addEventListener('keydown', yesMove);
		document.addEventListener('keyup', stopMove);
	
		// Display main message
		document.getElementById("play").style.display = "none";
		document.getElementById("message").style.display = "none";

		// Définition initiale de parameter pour cette portée de fonction (nouvelle partie)
		let parameter = {
			score: 0,
			live: 3, // Correspond aux 3 vies affichées dans l'UI
			level: 1,
			skills: 0.00,
		};

		// Réinitialisation de l'affichage du score, etc.
		dom("score", parameter.score);
		dom("live", parameter.live);
		dom("level", parameter.level);
		dom("skills", parameter.skills);

		// Réinitialisation de l'état du joueur
		paraShip.X = canvas.width / 2 - 15;
		paraShip.Y = 0;
		paraShip.velocityX = 0;
		paraShip.velocityY = 0;
		paraShip.live = 22;
		paraShip.shootGun = false;
		paraShip.left = false;
		paraShip.right = false;
		paraShip.up = false;
		paraShip.down = false;

		// Réinitialisation de l'état de l'ennemi
		badBoy.moveX = canvas.width / 2 - 15; // Position de dessin initiale X
		badBoy.moveY = 50;                  // Position de dessin initiale Y
		badBoy.health = 100;
		badBoy.speedX = 3 + (parameter.level -1) * 0.5; // Vitesse initiale tenant compte du niveau (même si niv 1 ici)
		badBoy.speedY = 2 + (parameter.level -1) * 0.2; // Vitesse initiale tenant compte du niveau
		badBoy.switchDirectionX = true;
		badBoy.switchDirectionY = true;
		badBoy.lastDirectionChange = 0;
		badBoy.canShoot = true;
		badBoy.lastShotTime = 0;
		// badBoy.X et badBoy.Y (positions de base) ne sont pas directement utilisés pour le mouvement,
		// mais pourraient être alignés si nécessaire :
		// badBoy.X = badBoy.moveX;
		// badBoy.Y = badBoy.moveY;


		enemyDescentTimer = 0;

		// Vider et réinitialiser les éléments dynamiques
		particles = [];
		asteroids = [];
		bunkers = [];
		initBunkers(); // Recrée les bunkers pour la nouvelle partie

		enemyGun.X = [];
		enemyGun.Y = [];
		enemyGun.fire = false;
		enemyGun.step = 0;

		paraGun.X = [];
		paraGun.Y = [];
		paraGun.fire = false;
		paraGun.step = 3;

		bonusShip = null;

		// Annuler toute boucle de jeu précédente avant d'en lancer une nouvelle.
		// loop_globalLoop est déclarée globalement implicitement par son utilisation dans globalLoop.
		// Il est préférable de la déclarer explicitement au scope global du script.
		if (typeof loop_globalLoop !== 'undefined' && loop_globalLoop !== null) {
			window.cancelAnimationFrame(loop_globalLoop);
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

		let particles = []; // Tableau pour stocker les particules d'explosion
		let asteroids = []; // Tableau pour stocker les astéroïdes
		let bunkers = []; // Tableau pour stocker les bunkers
		let bonusShip = null; // Pour le vaisseau bonus

		// Fonction pour créer une particule
		function createParticle(x, y, color) {
			return {
				x: x,
				y: y,
				size: Math.random() * 5 + 2, // Taille aléatoire entre 2 et 7
				color: color,
				velocityX: (Math.random() - 0.5) * 5, // Vitesse X aléatoire
				velocityY: (Math.random() - 0.5) * 5, // Vitesse Y aléatoire
				life: 30 + Math.random() * 30 // Durée de vie de la particule (en frames)
			};
		}

		// Fonction pour créer une explosion
		function createExplosion(x, y, color, numParticles = 20) {
			for (let i = 0; i < numParticles; i++) {
				particles.push(createParticle(x, y, color));
			}
			sound.explosion.play(); // Jouer le son d'explosion
		}

		// Fonction pour dessiner et mettre à jour les particules
		function handleParticles() {
			for (let i = particles.length - 1; i >= 0; i--) {
				let p = particles[i];
				ctx.beginPath();
				ctx.fillStyle = p.color;
				ctx.fillRect(p.x, p.y, p.size, p.size);

				p.x += p.velocityX;
				p.y += p.velocityY;
				p.life -= 1;

				if (p.life <= 0) {
					particles.splice(i, 1); // Supprimer la particule si sa durée de vie est écoulée
				}
			}
		}

		// Fonction pour créer un astéroïde
		function createAsteroid() {
			let size = Math.random() * 30 + 20; // Taille aléatoire entre 20 et 50
			let x = Math.random() * (canvas.width - size);
			let y = -size; // Apparaît en haut, hors de l'écran
			let speedY = Math.random() * 1 + 0.5 + (parameter.level * 0.1); // Vitesse de descente, augmente avec le niveau
			let color = `rgb(${Math.random()*100 + 100}, ${Math.random()*100 + 100}, ${Math.random()*100 + 100})`; // Couleur grisâtre aléatoire
			asteroids.push({ x, y, size, speedY, color, health: size }); // La vie de l'astéroïde dépend de sa taille
		}

		// Fonction pour dessiner et mettre à jour les astéroïdes
		function handleAsteroids() {
			// Créer de nouveaux astéroïdes de temps en temps
			// La fréquence augmente avec le niveau, mais pas trop vite.
			let asteroidSpawnRate = Math.max(100, 300 - parameter.level * 20);
			if (Math.random() < 1 / asteroidSpawnRate) {
				createAsteroid();
			}

			for (let i = asteroids.length - 1; i >= 0; i--) {
				let a = asteroids[i];
				ctx.beginPath();
				ctx.fillStyle = a.color;
				// Dessiner une forme d'astéroïde plus complexe (simplifié ici par un cercle)
				ctx.arc(a.x + a.size / 2, a.y + a.size / 2, a.size / 2, 0, Math.PI * 2);
				ctx.fill();
				// Ou un simple rectangle pour commencer: ctx.fillRect(a.x, a.y, a.size, a.size);


				a.y += a.speedY;

				// Supprimer les astéroïdes qui sortent de l'écran par le bas
				if (a.y > canvas.height) {
					asteroids.splice(i, 1);
					continue;
				}

				// Collision Astéroïde - Vaisseau Joueur
				let playerHitboxX = paraShip.X;
				let playerHitboxY = paraShip.Y + 690;
				let playerHitboxWidth = 30;
				let playerHitboxHeight = 10;

				if (a.x < playerHitboxX + playerHitboxWidth &&
					a.x + a.size > playerHitboxX &&
					a.y < playerHitboxY + playerHitboxHeight &&
					a.y + a.size > playerHitboxY) {

					createExplosion(a.x + a.size / 2, a.y + a.size / 2, a.color, Math.floor(a.size / 2));
					asteroids.splice(i, 1);
					sound.shock.play();
					paraShip.live -= 10; // Dégâts importants pour collision avec astéroïde
					dom("live", Math.max(0, Math.ceil(paraShip.live / (22/3))));
					if (paraShip.live <= 0) {
						// Logique de Game Over déjà gérée dans la section des tirs ennemis
						// On s'assure juste que l'explosion du joueur est créée si ce n'est pas déjà fait
						if(document.getElementById("message").textContent.indexOf("GAME OVER") === -1){
							createExplosion(paraShip.X + 15, paraShip.Y + 695, 'white');
							sound.loser.play();
							document.getElementById("message").textContent = "GAME OVER! Score: " + parameter.score;
							document.getElementById("message").style.display = "block";
							document.getElementById("play").textContent = "Rejouer?";
							document.getElementById("play").style.display = "block";
							window.cancelAnimationFrame(loop_globalLoop);
							document.removeEventListener('keydown', yesMove);
							document.removeEventListener('keyup', stopMove);
						}
						return; // Important pour stopper la boucle si game over
					}
					continue; // Passer à l'astéroïde suivant après collision
				}


				// Collision Astéroïde - Tirs du Joueur
				if (paraGun.fire) {
					let bulletX = paraGun.X[0] + 13;
					let bulletY = paraGun.limit - paraGun.step + paraGun.Y[0];
					if (bulletX > a.x && bulletX < a.x + a.size &&
						bulletY > a.y && bulletY < a.y + a.size) {

						a.health -= 25; // Dégâts du tir sur l'astéroïde
						// Effet visuel de tir touchant l'astéroïde (petite explosion/étincelle)
						createExplosion(bulletX, bulletY, 'orange', 3);

						// Réinitialiser le tir du joueur
						paraGun.step = 0;
						paraGun.X = [];
						paraGun.Y = [];
						paraGun.fire = false;
						paraShip.shootGun = false;

						if (a.health <= 0) {
							createExplosion(a.x + a.size / 2, a.y + a.size / 2, a.color, Math.floor(a.size / 2));
							asteroids.splice(i, 1);
							parameter.score += Math.floor(a.size / 2); // Points en fonction de la taille
							dom("score", parameter.score);
							sound.domages.play(); // Utiliser un son différent pour la destruction d'astéroïde ?
						}
						// Ne pas 'continue' ici, car un tir peut potentiellement traverser ou un autre astéroïde peut être touché dans la même frame.
                        // Cependant, comme le tir est réinitialisé, cela limite à une collision par tir.
					}
				}
			}
		}

		// --- Début des éléments inspirés de Space Invaders ---

		// Fonction pour initialiser les bunkers
		function initBunkers() {
			bunkers = []; // Réinitialiser les bunkers si on relance le jeu
			const bunkerWidth = 60;
			const bunkerHeight = 30;
			const bunkerPadding = 50;
			const numBunkers = 4;
			const startX = (canvas.width - (numBunkers * bunkerWidth + (numBunkers - 1) * bunkerPadding)) / 2;
			const bunkerY = canvas.height - 150; // Position Y des bunkers

			for (let i = 0; i < numBunkers; i++) {
				let x = startX + i * (bunkerWidth + bunkerPadding);
				// Chaque bunker est composé de plusieurs blocs
				let blocks = [];
				let blockWidth = 10;
				let blockHeight = 10;
				for (let r = 0; r < 3; r++) { // 3 rangées de blocs
					for (let c = 0; c < 6; c++) { // 6 colonnes de blocs
						// Forme de base du bunker (peut être affinée)
						if (r === 0 && (c === 0 || c === 5)) continue; // Coins supérieurs vides
						if (r === 1 && (c === 0 || c === 5) && Math.random() < 0.3) continue; // Ébrécher un peu
						blocks.push({
							x: x + c * blockWidth,
							y: bunkerY + r * blockHeight,
							width: blockWidth,
							height: blockHeight,
							health: 20 // Chaque bloc a de la vie
						});
					}
				}
				bunkers.push({ x, y: bunkerY, width: bunkerWidth, height: bunkerHeight, blocks });
			}
		}

		// Fonction pour dessiner les bunkers
		function drawBunkers() {
			ctx.fillStyle = 'green';
			bunkers.forEach(bunker => {
				bunker.blocks.forEach(block => {
					ctx.fillRect(block.x, block.y, block.width, block.height);
				});
			});
		}

		// Fonction pour gérer les collisions avec les bunkers
		function handleBunkerCollisions(bulletX, bulletY, bulletWidth, bulletHeight, isPlayerBullet) {
			for (let b = bunkers.length - 1; b >= 0; b--) {
				for (let i = bunkers[b].blocks.length - 1; i >= 0; i--) {
					let block = bunkers[b].blocks[i];
					if (bulletX < block.x + block.width &&
						bulletX + bulletWidth > block.x &&
						bulletY < block.y + block.height &&
						bulletY + bulletHeight > block.y) {

						block.health -= 10; // Dégâts sur le bloc
						if (block.health <= 0) {
							bunkers[b].blocks.splice(i, 1); // Détruire le bloc
						}
						return true; // Collision détectée et gérée
					}
				}
			}
			return false; // Pas de collision avec un bunker
		}

		// Fonction pour créer le vaisseau bonus
		function createBonusShip() {
			// Apparaît plus rarement et après un score un peu plus élevé
			if (!bonusShip && Math.random() < 0.0005 && parameter.score > 1500) {
				bonusShip = {
					x: canvas.width, // Commence à droite
					y: 50,
					width: 30,
					height: 15,
					speed: -2, // Se déplace de droite à gauche
					color: 'purple',
					points: Math.floor(Math.random() * 200) + 50 // Points bonus aléatoires
				};
				// sound.bonusShipAppear.play(); // Ajouter un son si disponible
			}
		}

		// Fonction pour dessiner et gérer le vaisseau bonus
		function handleBonusShip() {
			if (bonusShip) {
				ctx.fillStyle = bonusShip.color;
				ctx.fillRect(bonusShip.x, bonusShip.y, bonusShip.width, bonusShip.height);
				bonusShip.x += bonusShip.speed;

				// Collision avec tir joueur
				if (paraGun.fire) {
					let bulletX = paraGun.X[0] + 13;
					let bulletY = paraGun.limit - paraGun.step + paraGun.Y[0];
					if (bulletX > bonusShip.x && bulletX < bonusShip.x + bonusShip.width &&
						bulletY > bonusShip.y && bulletY < bonusShip.y + bonusShip.height) {

						createExplosion(bonusShip.x + bonusShip.width / 2, bonusShip.y + bonusShip.height / 2, bonusShip.color, 15);
						parameter.score += bonusShip.points;
						dom("score", parameter.score);
						// sound.bonusShipDestroyed.play(); // Ajouter un son
						bonusShip = null; // Détruire le vaisseau bonus
						// Réinitialiser le tir du joueur
						paraGun.step = 0;
						paraGun.X = [];
						paraGun.Y = [];
						paraGun.fire = false;
						paraShip.shootGun = false;
					}
				}

				if (bonusShip && bonusShip.x + bonusShip.width < 0) { // Si sort de l'écran à gauche
					bonusShip = null;
				}
			} else {
				createBonusShip(); // Essayer de créer un nouveau vaisseau bonus
			}
		}

		// Variable pour la descente des ennemis (Space Invaders style)
		let enemyDescentTimer = 0;
		const enemyDescentInterval = 300; // Descend toutes les X frames (ajuster pour la vitesse)
		const enemyDescentAmount = 5; // Descend de Y pixels

		// --- Fin des éléments inspirés de Space Invaders ---
		
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

				// Collision du tir ennemi avec le joueur OU les bunkers
				let enemyBulletX = enemyGun.X[0];
				let enemyBulletY = enemyGun.Y[0] + enemyGun.step;
				let enemyBulletWidth = 2;
				let enemyBulletHeight = 5;

				// Vérifier collision avec bunkers d'abord
				if (handleBunkerCollisions(enemyBulletX, enemyBulletY, enemyBulletWidth, enemyBulletHeight, false)) {
					enemyGun.step = 0; // Réinitialiser le tir ennemi
					enemyGun.X = [];
					enemyGun.Y = [];
					enemyGun.fire = false;
					createExplosion(enemyBulletX, enemyBulletY, 'lightgreen', 5); // Petite explosion sur bunker
				} else {
					// Collision avec le joueur
					let playerHitboxX = paraShip.X;
					let playerHitboxY = paraShip.Y + 690; // Y ajusté pour la base du vaisseau joueur
					let playerHitboxWidth = 30;
					let playerHitboxHeight = 10;

					if (enemyBulletX < playerHitboxX + playerHitboxWidth &&
						enemyBulletX + enemyBulletWidth > playerHitboxX &&
						enemyBulletY < playerHitboxY + playerHitboxHeight &&
						enemyBulletY + enemyBulletHeight > playerHitboxY) {

						sound.shock.play(); // Son de dégât sur le joueur
						paraShip.live -= 5; // Réduire la vie du joueur (valeur à ajuster)
					dom("live", Math.max(0, Math.ceil(paraShip.live / (22/3)))); // Mettre à jour l'affichage des vies (supposant que 22 = 3 vies UI)

					enemyGun.step = 0; // Réinitialiser le tir ennemi
					enemyGun.X = [];
					enemyGun.Y = [];
					enemyGun.fire = false;

					if (paraShip.live <= 0) {
						createExplosion(paraShip.X + 15, paraShip.Y + 695, 'white'); // Explosion du joueur
						sound.loser.play();
						// Afficher le message de fin de partie
						document.getElementById("message").textContent = "GAME OVER! Score: " + parameter.score;
						document.getElementById("message").style.display = "block";
						document.getElementById("play").textContent = "Rejouer?";
						document.getElementById("play").style.display = "block";

						// Cacher le vaisseau du joueur après l'explosion (ou le marquer comme détruit)
						// Pour simplement le cacher, on pourrait le déplacer hors de l'écran ou ne plus le dessiner.
						// Ici, nous allons juste arrêter le jeu. L'explosion sera visible pendant un court instant.

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
					// Détection de collision entre le tir du joueur et l'ennemi OU les bunkers
					let bulletX = paraGun.X[0] + 13;
					let bulletY = paraGun.limit - paraGun.step + paraGun.Y[0];
					let bulletWidth = 2;
					let bulletHeight = 5;

					// Vérifier collision avec bunkers d'abord
					if (handleBunkerCollisions(bulletX, bulletY, bulletWidth, bulletHeight, true)) {
						paraGun.step = 0; // Réinitialiser le tir
						paraGun.X = [];
						paraGun.Y = [];
						paraGun.fire = false;
						paraShip.shootGun = false;
						createExplosion(bulletX, bulletY, 'lightgreen', 5); // Petite explosion sur bunker
					} else {
						// Collision avec l'ennemi
						let enemyX = badBoy.moveX;
						let enemyY = badBoy.moveY;
						let enemyWidth = 30;
						let enemyHeight = 16; // Hauteur approximative de l'ennemi

						if (bulletX < enemyX + enemyWidth &&
							bulletX + bulletWidth > enemyX &&
							bulletY < enemyY + enemyHeight &&
							bulletY + bulletHeight > enemyY) {

							sound.domages.play();
							badBoy.health -= 25; // Réduire la vie de l'ennemi
							paraGun.step = 0; // Réinitialiser le tir pour qu'il disparaisse
							paraGun.X = [];
							paraGun.Y = [];
							paraGun.fire = false;
							paraShip.shootGun = false;

							if (badBoy.health <= 0) {
								createExplosion(badBoy.moveX + 15, badBoy.moveY + 8, badBoy.color[parameter.level] || 'yellow'); // Explosion de l'ennemi
								// sound.explosion.play(); // Déjà joué dans createExplosion
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

			handleParticles(); // Gérer les particules d'explosion à chaque frame
			handleAsteroids(); // Gérer les astéroïdes à chaque frame
			drawBunkers();     // Dessiner les bunkers
			handleBonusShip(); // Gérer le vaisseau bonus

			// Logique de descente de l'ennemi (Space Invaders style)
			enemyDescentTimer++;
			if (enemyDescentTimer >= enemyDescentInterval) {
				badBoy.moveY += enemyDescentAmount;
				enemyDescentTimer = 0;
				// Si l'ennemi atteint le bas (ou une certaine hauteur proche des bunkers/joueur)
				if (badBoy.moveY + 16 > canvas.height - 150) { // 16 est la hauteur de l'ennemi, 150 la position des bunkers
					// GAME OVER - les envahisseurs ont atteint la base
					if(document.getElementById("message").textContent.indexOf("GAME OVER") === -1){
						createExplosion(paraShip.X + 15, paraShip.Y + 695, 'white', 40); // Grosse explosion joueur
						sound.loser.play();
						document.getElementById("message").textContent = "GAME OVER! Invaders reached the base. Score: " + parameter.score;
						document.getElementById("message").style.display = "block";
						document.getElementById("play").textContent = "Rejouer?";
						document.getElementById("play").style.display = "block";
						window.cancelAnimationFrame(loop_globalLoop);
						document.removeEventListener('keydown', yesMove);
						document.removeEventListener('keyup', stopMove);
						return;
					}
				}
			}


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