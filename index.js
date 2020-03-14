(function (document, window) {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext('2d');
  let gameSpeed = 30;
  let computerPaddleSpeed = 5;
  let playerScore = 0;
  let computerScore = 0;

  /**
   * Ball Constructor
   */
  function Ball() {
    this.color = "white";
    this.size = {
      x: 10,
      y: 10
    };
    this.position = {
      x: (canvas.width / 2) - (this.size.x / 2),
      y: (canvas.height / 2) - (this.size.y / 2)
    };
    this.velocityX = -10;
    this.velocityY = 10;
  };

  Ball.prototype.calculatePosition = function () {
    this.position.x = this.position.x + this.velocityX;
    this.position.y = this.position.y + this.velocityY;
  };

  /**
   * Paddle constructor
   * @param {string} position Accepts left or right 
   */
  function Paddle(position, paddleSpeed) {
    this.color = "white";
    this.size = {
      x: 15,
      y: 80
    };
    this.position = {
      x: position === "left" ? 10 : canvas.width - 25,
      y: canvas.height / 2
    };
    this.speed = paddleSpeed
  };

  /**
   * @param {object} ball
   */
  Paddle.prototype.HandleComputerMovement = function (ball) {
    const topOfPaddle = this.position.y;
    const bottomOfPaddle = this.position.y + this.size.y;

    if (topOfPaddle > ball.position.y && bottomOfPaddle > ball.position.y) {
      this.position.y = this.position.y - this.speed
    } else if (topOfPaddle < ball.position.y && bottomOfPaddle < ball.position.y) {
      this.position.y = this.position.y + this.speed
    }

  }

  /**
   * 
   * @param {Object} obj expects {x: #, y:#}
   */
  const hasXY = (obj) => {
    if (typeof (obj) !== "object") {
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
    if (hasXY(position) && hasXY(size)) {

      // draw canvas
      context.fillStyle = color;
      context.fillRect(position.x, position.y, size.x, size.y);
    } else {
      console.error('Incorrect params for position or size objects')
    }
  };

  const PrintScores = (context, score, x, y) => {
    context.font = "30px Arial";
    context.color = "white";
    context.fillText(score, x, y)
  }

  const CalculateMousePosition = evt => {
    const rect = canvas.getBoundingClientRect();
    const root = document.documentElement;
    const mouseX = evt.clientX - rect.left - root.scrollLeft;
    const mouseY = evt.clientY - rect.top - root.scrollTop;

    return {
      x: mouseX,
      y: mouseY
    }
  };

  /**
   * 
   * @param {object} game 
   */
  const MoveSprites = (game) => {
    game.ball.calculatePosition();
    game.computerPaddle.HandleComputerMovement(game.ball);
  };

  /**
   * 
   * @param {HTMLElement} context 
   * @param {Game} game 
   */
  const DrawEverything = (context, game) => {
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    Draw(context, game.ball.color, game.ball.position, game.ball.size);
    Draw(context, game.playerPaddle, game.playerPaddle.position, game.playerPaddle.size);
    Draw(context, game.computerPaddle, game.computerPaddle.position, game.computerPaddle.size);

    PrintScores(context, playerScore, 200, 100);
    PrintScores(context, computerScore, 550, 100);
  };

  const Reset = (ball, paddle) => {

    // Reset ball position and direction
    ball.position.x = canvas.width / 2 - (ball.size.x / 2)
    ball.position.y = canvas.height / 2 - (ball.size.y / 2)
    ball.velocityX = -ball.velocityX;

    // Reset computer paddle
    paddle.position.y = (canvas.height / 2) - (paddle.size.y / 2)
  };

  /**
   * 
   * @param {object} game 
   * @returns {boolean}
   */
  const CheckBallHitPaddle = (game, paddle) => {
    return (
      game.ball.position.y > game[paddle].position.y &&
      game.ball.position.y < (game[paddle].position.y + game[paddle].size.y));
  };

  /**
   * Check if ball has moved outside of canvas boundaries
   * @param {object} game 
   * @param {function} timer 
   */
  const CheckWinLoseConditions = (game, timer) => {

    if (game.ball.position.x > canvas.width - 15) {
      const didBallHitPaddle = CheckBallHitPaddle(game, "computerPaddle");
      if (didBallHitPaddle) {
        game.ball.velocityX = -game.ball.velocityX;
      } else {
        // Increment player score
        playerScore++;
        Reset(game.ball, game.computerPaddle);
      }
    }

    if (game.ball.position.x < 15) {
      const didBallHitPaddle = CheckBallHitPaddle(game, "playerPaddle");
      if (didBallHitPaddle) {
        game.ball.velocityX = -game.ball.velocityX;
      } else {
        computerScore++;
        Reset(game.ball, game.computerPaddle);
      }

      // if game is won delete self and prompt for new game
      if (computerScore === 10 || playerScore === 10) {
        game.end(game)
      }
    }

    // if ball hits player paddle or computer paddle reverse direction

    // clearInterval(timer);
    // game.end();
    // if(){
    //   // game.ball.velocityX = -game.ball.velocityX;
    // } else if(game.ball.position.x < 0) {
    //   game.ball.velocityX = Math.abs(game.ball.velocityX)
    // }

    if (game.ball.position.y > canvas.height) {
      game.ball.velocityY = -game.ball.velocityY;
    } else if (game.ball.position.y < 0) {
      game.ball.velocityY = Math.abs(game.ball.velocityY)
    }
  }

  /**
   * Game Constructor
   * @param {number} speed 
   */
  function Game(speed) {
    this.ball = new Ball();
    this.playerPaddle = new Paddle("left");
    this.computerPaddle = new Paddle("right", computerPaddleSpeed);
    this.framesPerSecond = speed;
  };

  Game.prototype.play = function (context) {
    // context.clearRect(0, 0, canvas.width, canvas.height);
    const startTimer = setInterval(() => {
        clearInterval(startTimer);
        const timer = setInterval(() => {
          
          MoveSprites(this);
          DrawEverything(context, this);
          CheckWinLoseConditions(this, timer);
        }, 1000 / this.framesPerSecond)
    }, 1000)
  };

  Game.prototype.end = function (game) {
    const event = new CustomEvent('end', {})
    dispatchEvent(event);
    game = null;
  };

  /**
   * Start a new game
   * @param {number} gameSpeed 
   */
  const StartGame = (gameSpeed) => {

    // set game speed
    let level = 1;
    const game = new Game(gameSpeed);
    canvas.addEventListener('mousemove', evt => {
      const mousePos = CalculateMousePosition(evt);
      game.playerPaddle.position.y = mousePos.y - (game.playerPaddle.size.y / 2);
    })
    game.play(context);
  };

  // Listen for end of game and ask user if they want to play again
  window.addEventListener('end', () => {
    const answer = confirm('Play Again');

    // // if yes start new game but faster and increment level
    // if (answer) {
    //   playerScore = 0;
    //   computerScore = 0;
    //   gameSpeed += 5;
    //   computerPaddleSpeed += 5;
    //   StartGame(gameSpeed)
    // }
  });



  StartGame(gameSpeed);

})(document, window)