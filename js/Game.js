class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");
    
    this.leadeboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.playermoving=false
    this.lefKeyActive=false
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

    // C38 TA
    fuels = new Group();
    powerCoins = new Group();
    obstacle1Group = new Group();
    obstacle2Group = new Group();
    // Adding fuel sprite in the game
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Adding coin sprite in the game
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);

    this.addSprites(obstacle1Group, 4, obstacle1Image, 0.02);

    this.addSprites(obstacle2Group, 4, obstacle2Image, 0.02);
  }

  // C38 TA
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      x = random(width / 2 + 150, width / 2 - 150);
      y = random(-height * 4.5, height - 400);

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");
    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);
    this.leadeboardTitle.html("Leaderboard");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();
    Player.getPlayersInfo();
    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);
      this.showLeaderboard();
      this.showLife();
      this.showfuelBar()
      //index of the array
      var index = 0;
      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the cars in x and y direction
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        // C38  SA
        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleFuel(index);
          this.handlePowerCoins(index);
          this.handleObstacles(index);
          this.handleObstacles2(index);
          // Changing camera position in y direction
          //camera.position.x = cars[index - 1].position.x;
          camera.position.y = cars[index - 1].position.y;

        }
      }

      // handling keyboard events
      if (keyIsDown(UP_ARROW)) {
        this.playermoving=true
        player.positionY += 10;
        player.update();
      }
      this.handlePlayerControls();
      const finishLine = height * 6 - 100;

      if (player.positionY > finishLine) {
        gameState = 2;
        player.rank += 1;
        Player.updateCarsAtEnd(player.rank);
        player.update();
        this.showRank();
      }

      drawSprites();
    }
  }

  handleFuel(index) {
    // Adding fuel
    cars[index - 1].overlap(fuels, function(collector, collected) {
      player.fuel+=10;
      player.update()
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });
    if(player.fuel>0 && this.playermoving){
      player.fuel-=0.3
    }
    if(player.fuel<=0){
      gameState=2
      this.gameOver()
    }
  }

  handlePowerCoins(index) {
    cars[index - 1].overlap(powerCoins, function(collector, collected) {
      player.score += 20;
      player.life += 10
      player.update();
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });
    if(player.score>0 && this.playermoving){
      player.score-=0.3
    }
    if(player.fuel<=0){
      gameState=2
      this.gameOver()
    }
  }

  handleObstacles(index){
    if(cars[index - 1].collide(obstacle1Group)){
      if(this.lefKeyActive){
        player.positionX+=100
      }
      else{
        player.positionX-=100
      }
      if(player.life>0){
        player.life-=180/4
      }
      player.update();
    }
  }
  handleObstacles2(index){
    if(cars[index - 1].collide(obstacle2Group)){
      if(this.lefKeyActive){
        player.positionX+=100
      }
      else{
        player.positionX-=100
      }
      if(player.life>0){
        player.life-=180/4
      }
      player.update();
    }
  }

handleResetButton() {
  this.resetButton.mousePressed(() => {
    database.ref("/").set({
      playerCount: 0,
      gameState: 0,
      players: {}
    });
    window.location.reload();
  });
}

showLife() {
  push();
  image(lifeImage, width / 2 - 130, height - player.positionY - 400, 20, 20);
  fill("white");
  rect(width / 2 - 100, height - player.positionY - 300, 185, 20);
  fill("#f50057");
  rect(width / 2 - 100, height - player.positionY - 300, player.life, 20);
  noStroke();
  pop();
}
showLeaderboard() {
  var leader1, leader2;
  var players = Object.values(allPlayers);
  if (
    (players[0].rank === 0 && players[1].rank === 0) ||
    players[0].rank === 1
  ) {
    // &emsp;    This tag is used for displaying four spaces.
    leader1 =
      players[0].rank +
      "&emsp;" +
      players[0].name +
      "&emsp;" +
      players[0].score;

    leader2 =
      players[1].rank +
      "&emsp;" +
      players[1].name +
      "&emsp;" +
      players[1].score;
  }

  if (players[1].rank === 1) {
    leader1 =
      players[1].rank +
      "&emsp;" +
      players[1].name +
      "&emsp;" +
      players[1].score;

    leader2 =
      players[0].rank +
      "&emsp;" +
      players[0].name +
      "&emsp;" +
      players[0].score;
  }

  this.leader1.html(leader1);
  this.leader2.html(leader2);
}

handlePlayerControls() {
  if (keyIsDown(UP_ARROW)) {
    this.playermoving=true
    this.lefKeyActive=false
    player.positionY += 10;
    player.update();
  }

  if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
    this.playermoving=true
    this.lefKeyActive=true
    player.positionX -= 5;
    player.update();
  }

  if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
    this.playermoving=true
    this.lefKeyActive=false
    player.positionX += 5;
    player.update();
  }
}
showRank() {
  swal({
    title: `Awesome ${"\n"} Rank${"\n"} ${player.rank} ${"\n"} Score${player.score}`,
    text: "You reached the finish line successfully",
    imageUrl:
      "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
    imageSize: "100x100",
    confirmButtonText: "Ok"
  });
}
gameOver(){
  swal({
    title: `Score${player.score}`,
    text: "You lose",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
    imageSize: "100x100",
    confirmButtonText: "Ok"
  });
}
showlife(){
  push()
  image(lifeImage, width/2-130, height-player.positionY-300,20,20)
  fill("white")
  rect(width/2-100, height-player.positionY-300,180,20)
  fill("yellow")
  rect(width/2-100, height-player.positionY-300,player.life,20)
  pop()
}
showfuelBar(){
  push()
  image(fuelImage, width/2-130, height-player.positionY-100,20,20)
  fill("white")
  rect(width/2-100, height-player.positionY-100,180,20)
  fill("green")
  rect(width/2-100, height-player.positionY-100,player.fuel,20)
  pop()
}

}