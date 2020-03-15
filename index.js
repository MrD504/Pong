(function (document, window) {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext('2d');
  let gameSpeed = 30;
  let paddleSpeed = 5;

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
    }
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

      if (topOfPaddle > ball.position.y && bottomOfPaddle > ball.position.y) {
        this.position.y = this.position.y - this.speed
      } else if (topOfPaddle < ball.position.y && bottomOfPaddle < ball.position.y) {
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
  };

  const Reset = (ball, paddle) => {

    // Reset ball position and direction
    ball.position.x = canvas.width / 2 - (ball.size.x / 2);
    ball.position.y = canvas.height / 2 - (ball.size.y / 2);
    ball.velocityX = -ball.velocityX;
    ball.velocityY = 0;

    // Reset computer paddle
    paddle.position.y = (canvas.height / 2) - (paddle.size.y / 2);
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
      game.destroy(timer);
      PrintMsg(context, 'You Win!', 350, 200);

      // force end to be on next tick
      setTimeout(() => {
        game.end(true)
        game.playerScore = 0;
        game.computerScore = 0;
        game.gameSpeed += 5;
        game.computerPaddleSpeed += 5;
        return;
      })
    }

      // handle end of game exception
    if (game.ball) {
      if (game.ball.position.x > canvas.width - 15) {
        const didBallHitPaddle = CheckBallHitPaddle(game, "computerPaddle");
        if (didBallHitPaddle) {
          const deltaY = game.ball.position.y - (game.playerPaddle.position.y + game.playerPaddle.size.y/2);
          console.log(deltaY)
          game.ball.velocityX = -game.ball.velocityX;
          game.ball.velocityY = deltaY * 0.15         
        } else {
          // Increment player score
          game.IncrementPlayerScore()
          Reset(game.ball, game.computerPaddle);
        }
      }

      if (game.ball.position.x < 15) {
        const didBallHitPaddle = CheckBallHitPaddle(game, "playerPaddle");
        if (didBallHitPaddle) {
          const deltaY = game.ball.position.y - (game.playerPaddle.position.y + game.playerPaddle.size.y/2);

          game.ball.velocityX = -game.ball.velocityX;
          game.ball.velocityY = deltaY * 0.15
        } else {
          game.IncrementComputerScore();
          Reset(game.ball, game.computerPaddle);
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
      this.ball = new Ball();
      this.playerPaddle = new Paddle("left");
      this.computerPaddle = new Paddle("right", computerPaddleSpeed);
      this.framesPerSecond = 1000 / fps;
      this.computerPaddleSpeed = computerPaddleSpeed;
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

    /**
     * @param {boolean} win did player win
     */
    end = (win) => {
      const event = new CustomEvent('end', {
        detail: win
      })
      dispatchEvent(event);
    };

    IncrementComputerScore = () => {
      this.computerScore++;
    };

    IncrementPlayerScore = () => {
      this.playerScore++;
    }

    /**
     * @param {function} timer
     */
    destroy = (timer) => {
      clearInterval(timer);
      window.removeEventListener("mousemove", null);
      delete (this)
      delete (this.ball)
      delete (this.playerPaddle);
      delete (this.computerPaddle);
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

  // Listen for end of game and ask user if they want to play again
  window.addEventListener('end', (evt) => {
    const answer = confirm('Play Again');
    console.log(evt)
    // // if yes start new game but faster and increment level
    if (answer) {
      if (evt.detail) {
        gameSpeed += 5;
        paddleSpeed += 0.1
      }
      StartGame(gameSpeed, paddleSpeed)
    }
  });

  StartGame(gameSpeed, paddleSpeed);

})(document, window)
