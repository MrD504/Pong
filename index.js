(function (document, window) {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext('2d');
  let gameSpeed = 30;
  let paddleSpeed = 1;

  class ObjXY {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  }

  /**
   * Create instance of a ball
   */
  class Ball {
    constructor() {
      this.color = "white";
      this.size = new ObjXY(10, 10);
      this.position = new ObjXY(
        (canvas.width / 2) - (this.size.x / 2),
        (canvas.height / 2) - (this.size.y / 2)
      );
      this.velocityX = -15;
      this.velocityY = 0;
    };

    calculateNextPosition = () => {
      this.position.x = this.position.x + this.velocityX;
      this.position.y = this.position.y + this.velocityY;
    };

    calculateVelocityY = (paddle) => {
      const MAX_VELOCITY = this.velocityX * 1.25; // cap the speed of the ball
      const deltaY = (this.position.y - (paddle.position.y + paddle.size.y / 2)) * 0.15;
      if (Math.abs(deltaY) < MAX_VELOCITY && this.velocityY < 0) {
        this.velocityY = MAX_VELOCITY
      } else if (Math.abs(deltaY) > MAX_VELOCITY && this.velocityY > 0) {
        this.velocityY = -MAX_VELOCITY
      } else {
        this.velocityY = deltaY;
      }

    };
  }

  /**
   * Paddle constructor
   * @param {string} position Accepts left or right 
   * @param {number}}paddleSpeed speed at which paddle can react
   */
  class Paddle {
    constructor(position, paddleSpeed) {
      this.color = "white";
      this.size = new ObjXY(15, 80);
      this.position = new ObjXY(
        (position === "left" ? 10 : canvas.width - 25),
        (canvas.height / 2)
      );
      this.speed = paddleSpeed;
    }

    /**
     * @param {object} ball
     */
    handleComputerMovement = (ball) => {
      const topOfPaddle = this.position.y;
      const bottomOfPaddle = this.position.y + this.size.y;
      const middleOfPaddle = this.position.y + ((bottomOfPaddle - topOfPaddle) / 2)

      // if (topOfPaddle > ball.position.y && bottomOfPaddle > ball.position.y) {
      if(middleOfPaddle > (ball.position.y + 35)){  
        this.position.y = this.position.y - this.speed
      // } else if (topOfPaddle < ball.position.y && bottomOfPaddle < ball.position.y) {
      } else if (middleOfPaddle < (ball.position.y - 35)) {
        this.position.y = this.position.y + this.speed
      }
    }
  };

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
    // draw canvas
    context.fillStyle = color;
    context.fillRect(position.x, position.y, size.x, size.y);
  };

  const PrintMsg = (context, score, x, y) => {
    context.font = "30px Arial";
    context.color = "white";
    context.fillText(score, x, y)
  }

  const calculateMousePosition = evt => {
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
    game.ball.calculateNextPosition();
    game.computerPaddle.handleComputerMovement(game.ball);
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

    PrintMsg(context, game.playerScore, 200, 100);
    PrintMsg(context, game.computerScore, 550, 100);
    PrintMsg(context, `Level ${game.level}`, 350, 300);
  };



  /**
   * 
   * @param {object} game 
   * @returns {boolean}
   */
  const CheckBallHitPaddle = (game, paddle) => {
    // add 5 to either side of the paddle for cleaner hits

    return (
      game.ball.position.y > (game[paddle].position.y - 5) &&
      game.ball.position.y < (game[paddle].position.y + game[paddle].size.y) + 5);
  };

  /**
   * Check if ball has moved outside of canvas boundaries
   * @param {object} game 
   * @param {function} timer 
   */
  const CheckWinLoseConditions = (game, timer) => {

    // if game is won delete self and prompt for new game
    if (game.computerScore === game.MAX_SCORE) {
      game.destroy(timer);
      PrintMsg(context, 'You Lose!', 350, 200);

      // force end to be on next tick
      setTimeout(() => {
        game.end(false)
        return;
      })
    }

    if (game.playerScore === game.MAX_SCORE) {
      // PrintMsg(context, 'You Win!', 350, 200);
      game.nextLevel()
    }

    // handle end of game exception
    if (game.ball) {
      if (game.ball.position.x > canvas.width - 15) {
        const didBallHitPaddle = CheckBallHitPaddle(game, "computerPaddle");
        if (didBallHitPaddle) {

          game.ball.velocityX = -game.ball.velocityX;
          game.ball.calculateVelocityY(game.computerPaddle)
        } else {
          // Increment player score
          game.IncrementPlayerScore()
          game.Reset(game.ball, game.computerPaddle);
        }
      }

      if (game.ball.position.x < 15) {
        const didBallHitPaddle = CheckBallHitPaddle(game, "playerPaddle");
        if (didBallHitPaddle) {
          game.ball.velocityX = -game.ball.velocityX;
          game.ball.calculateVelocityY(game.playerPaddle)
        } else {
          game.IncrementComputerScore();
          game.Reset(game.ball, game.computerPaddle);
        }
      }


      // if ball hits player paddle or computer paddle reverse direction
      if (game.ball.position.y > canvas.height) {
        game.ball.velocityY = -game.ball.velocityY;
      } else if (game.ball.position.y < 0) {
        game.ball.velocityY = Math.abs(game.ball.velocityY)
      }
    }
  }

  /**
   * Game Constructor
   * @param {number} fps frames per second 
   * @param {number} gameSpeed
   * @param {number} computerPaddleSpeed how fast the computers paddle can react
   */
  class Game {
    constructor(fps, computerPaddleSpeed) {
      this.level = 1;
      this.ball = new Ball();
      this.gameSpeed = fps;
      this.computerPaddleSpeed = computerPaddleSpeed;
      this.playerPaddle = new Paddle("left");
      this.computerPaddle = new Paddle("right", this.computerPaddleSpeed);
      this.framesPerSecond = 1000 / this.gameSpeed;
      this.MAX_SCORE = 3;
      this.playerScore = 0;
      this.computerScore = 0;
    };

    play = (context) => {
      const startTimer = setInterval(() => {
        clearInterval(startTimer);
        const timer = setInterval(() => {

          MoveSprites(this);
          DrawEverything(context, this);
          CheckWinLoseConditions(this, timer);
        }, 1000 / this.framesPerSecond)
      }, 1000)
    }

    nextLevel = () => {
      this.level = this.level + 1;
      this.playerScore = 0;
      this.computerScore = 0;
      this.gameSpeed += 5;
      this.computerPaddle.speed *= 2;

      this.Reset();
    }
    /**
     * @param {boolean} win did player win
     */
    end = () => {
      this.ball.velocityY = 0;
      this.ball.velocityX = 0;
      this.playerScore = 0;
      this.computerScore = 0;
      context.clearRect(0, 0, canvas.width, canvas.height);

      PrintMsg(context, "GAME OVER", 300, 200)
      PrintMsg(context, "Click to Play again", 275, 300);
      canvas.onclick = (evt) => {
        evt.preventDefault();
        canvas.onclick = null;
        // Reset game
        this.ResetGameSettings();
        this.Reset();

        this.ball.velocityX = -15;

        // play game
        this.play(context);
        context.clearRect(0, 0, canvas.width, canvas.height);

      }
    };

    IncrementComputerScore = () => {
      this.computerScore++;
    };

    IncrementPlayerScore = () => {
      this.playerScore++;
    };

    ResetGameSettings = () => {
      // Reset Level Number
      this.level = 1;

      // Reset Speeds
      this.gameSpeed = gameSpeed;
      this.computerPaddle.speed = paddleSpeed;
    }

    Reset = (ball, paddle) => {

      // Reset ball position and direction
      if (ball) {
        ball.position.x = canvas.width / 2 - (ball.size.x / 2);
        ball.position.y = canvas.height / 2 - (ball.size.y / 2);
        ball.velocityX = -ball.velocityX;
        ball.velocityY = 0;

      }
      // Reset computer paddle
      // paddle.position.y = (canvas.height / 2) - (paddle.size.y / 2);
    };

    /**
     * @param {function} timer
     */
    destroy = (timer) => {
      clearInterval(timer);
      // delete (this)
      // delete (this.ball)
      // delete (this.playerPaddle);
      // delete (this.computerPaddle);
    }
  };

  /**
   * Start a new game
   * @param {number} gameSpeed 
   * @param {number} cps Computer paddle speed
   */
  const StartGame = (gameSpeed, cps) => {

    // set game speed
    let level = 1;
    const game = new Game(gameSpeed, cps);
    canvas.addEventListener('mousemove', evt => {
      const mousePos = calculateMousePosition(evt);

      // handle end of game exception
      if (game.playerPaddle) {
        game.playerPaddle.position.y = mousePos.y - (game.playerPaddle.size.y / 2);
      }
    })
    game.play(context);
  };

  StartGame(gameSpeed, paddleSpeed);

})(document, window)
