(function(document, window) {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext('2d');
  let gameSpeed = 50;

  /**
   * Ball Constructor
   */
  function Ball() {
    this.color = "white";
    this.size ={
      x: 10,
      y: 10
    };
    this.position = {
      x: 0,
      y: (canvas.height / 2) - (this.size.y / 2)
    };
    this.velocity = 10;
  };

  Ball.prototype.calculatePosition = function() {
    this.position.x = this.position.x + this.velocity;
  };

  /**
   * Paddel constructor
   * @param {string} position Accepts left or right 
   */
  function Paddel(position) {
    this.color = "white";
    this.size = {
      x: 15,
      y: 80
    };
    this.position = {
      x: position === "left" ? 10 : canvas.width - 25,
      y: canvas.height / 2
    };
  }

  /**
   * 
   * @param {Object} obj expects {x: #, y:#}
   */
  const hasXY = (obj) => {
    if (typeof(obj) !== "object") {
      return false;
    }
    return obj.x !== undefined && obj.y !== undefined;
  }
  /**
   * Draw to context
   * @param {HTMLElement} context 
   * @param {string} color 
   * @param {Object} position - Shape {x: #, y: #}
   * @param {Object} size - Shape {x: #, y: #}
   */
  const Draw = (context, color, position, size) => {
    
    
    // check that x and y keys exist on position and size objects
    if(hasXY(position) && hasXY(size)) {
      
      // draw canvas
      context.fillStyle = color;
      context.fillRect(position.x, position.y ,size.x, size.y);
    } else {
      console.error('Incorrect params for position or size objects')
    }
  };

  /**
   * 
   * @param {object} game 
   */
  const MoveSprites = (game) => {
    game.ball.calculatePosition();
  };

  /**
   * 
   * @param {HTMLElement} context 
   * @param {Game} game 
   */
  const DrawEverything = (context, game) => {
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    Draw(context, game.ball.color, game.ball.position, game.ball.size)
    Draw(context, game.playerPaddel, game.playerPaddel.position, game.playerPaddel.size)
    Draw(context, game.computerPaddel, game.computerPaddel.position, game.computerPaddel.size)
  };

  /**
   * Check if ball has moved outside of canvas boundaries
   * @param {object} game 
   * @param {function} timer 
   */
  const CheckWinLoseConditions = (game, timer) => {
    if(game.ball.position.x > canvas.width) {
      // clearInterval(timer);
      // game.end();
      game.ball.velocity = -game.ball.velocity;
    } else if(game.ball.position.x < 0) {
      game.ball.velocity = Math.abs(game.ball.velocity)
    }
  }

  /**
   * Game Constructor
   * @param {number} speed 
   */
  function Game (speed) {
    this.ball = new Ball();
    this.playerPaddel = new Paddel("left");
    this.computerPaddel = new Paddel("right");
    this.framesPerSecond = speed;
  };
  
  Game.prototype.play = function(context) {
    const timer = setInterval(() => {
      MoveSprites(this);
      DrawEverything(context, this)
      CheckWinLoseConditions(this, timer)
    }, 1000 / this.framesPerSecond)
  };

  Game.prototype.end = function() {
    const event = new CustomEvent('end', {})
    dispatchEvent(event);
  };

  /**
   * Start a new game
   * @param {number} gameSpeed 
   */
  const StartGame = (gameSpeed) => {
    
    // set game speed
    let level = 1;
    const game = new Game(gameSpeed);
    game.play(context);
  };
  
  // Listen for end of game and ask user if they want to play again
  window.addEventListener('end', () => {
    // const answer = confirm('Play Again');
    
    // // if yes start new game but faster and increment level
    // if (answer) {
    //   gameSpeed += 5;
    //   StartGame(gameSpeed)
    // }
  });
  
  StartGame(gameSpeed);

})(document, window)