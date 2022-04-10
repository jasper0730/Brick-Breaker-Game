let canvas = document.getElementById("myCanvas"); //取得DOM元素
let ctx = canvas.getContext("2d"); // 建立ctx變數儲存"2D渲染環境"，ctx變數實際拿來繪製Canvas的工具。
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
let ballRadius = 10; // 球的半徑
let paddleHeight = 10; // 球拍的高
let paddleWidth = 75; // 球拍的寬
let paddleX = (canvas.width - paddleWidth) / 2; // x轴上的初始位置
let rightPressed = false;
let leftPressed = false;
let bricks = [];
let score = 0; // 初始化分數
let lives = 3;
// ctx.rect(20, 40, 50, 50); // 正方形距離左邊20px，距離畫面上方40px，50px寬，50 px高
// ctx.beginPath();
// ctx.arc(240, 160, 20, 0, Math.PI * 2, false);
// 圓弧中心的x、y座標
// 圓弧的半徑
// 圓弧開始和結束的角度(從開始到結束的角度, 以弧度表示)
// 繪製的方向(false代表順時針方向, 預設或true為逆時針方向) 最後一個參數並非必要

// 磚塊
let brickRowCount = 3; //行
let brickColumnCount = 5; //列
let brickWidth = 75; //寬
let brickHeight = 20; //高
let brickPadding = 10; //本體
let brickOffsetTop = 30;  //距離上方
let brickOffsetLeft = 30;  //距離下方

for (c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

// 球的樣式
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2); // 圓弧開始和結束的角度(從開始到結束的角度, 以弧度表示)
  ctx.fillStyle = "#fff";
  ctx.fill(); //實心圖形
  // ctx.stroke(); //空心圖形
  ctx.closePath();
}

// 球拍樣式
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

// 磚塊
function drawBricks() {
  for (c = 0; c < brickColumnCount; c++) {
    for (r = 0; r < brickRowCount; r++) {
      // 判斷如果status為1則渲染，若為0則代表球碰到後磚塊消失
      if (bricks[c][r].status == 1) {
        // 計算每次循環後的磚塊位置
        var brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        var brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        // 磚塊樣式
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// 球的行為路徑
function draw() {
  // 前兩個參數代表了長方形左上角的 x和 y座標，後兩個參數代表了長方形右下角的 x 和 y 座標。
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall(); // 渲染球道畫面上
  drawPaddle(); // 渲染球拍到畫面上
  drawBricks(); // 渲染磚塊到畫面上
  collisionDetection(); // 碰到磚塊的行為
  drawScore() //渲染分數
  drawLives(); // 渲染生命值
  // 利用 dx 和 dy 來更新 x 和 y 的數值，球就會在每次更新後被畫到不同的位置。
  x += dx;
  y += dy;
  // 球碰到邊緣的反彈行為，如果觸碰到上或下的邊緣,則反彈
  // canvas.width-ballRadius 原本碰到牆壁會陷入一半的求才反彈,所以扣除球本體的半徑
  // 碰到左右反彈
  if (x + dx > canvas.width - ballRadius || x + dx < 0) {
    dx = -dx;
  }
  // 判斷碰到上方的邊緣反彈
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    //如果球碰到底部，判斷是否碰到球拍，是的話反彈
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    }
    // 不是碰到球拍則
    else {
      // 判斷如果生命值是否為0，是的話則遊戲結束，如果不是就初始化重新挑戰
      if (!lives) {
        alert("GAME OVER");
        document.location.reload();
      }
      else {
        if(lives>1){
          alert(`您還有${lives-1}次機會`)
        } else {
          alert(`最後一次機會，請加油!!`)
        }
        
        lives = lives - 1;
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = 3;
        dy = -3;
        paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  }

  // 定義球拍的移動範圍
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  }
  else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler(e) {
  // e.clientX = 屬標在視窗中的水平位置
  // canvas.offsetLeft = canvas 元素左邊框到视窗左邊框的距離
  // relativeX = canvas 元素左邊框到鼠標的距離
  let relativeX = e.clientX - canvas.offsetLeft;
  // 判斷如果此值大於0，但小於canvas的寬度代表署標在canvas範圍內
  if (relativeX > 0 && relativeX < canvas.width) {
    // paddleX = 球拍的中心(確保移動是針對球拍的中心)
    paddleX = relativeX - paddleWidth / 2;
  }
}

// 37 = 左鍵
// 39 = 右鍵
// 點擊滑鼠左右鍵按下的行為
function keyDownHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = true;
  }
  else if (e.keyCode == 37) {
    leftPressed = true;
  }
}

// 點擊滑鼠左右鍵放開的行為
function keyUpHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = false;
  }
  else if (e.keyCode == 37) {
    leftPressed = false;
  }
}

// 球碰到磚的行為
function collisionDetection() {
  for (c = 0; c < brickColumnCount; c++) {
    for (r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];//磚塊的位置
      // 先判斷磚塊是否存在，如果存在往下執行
      if (b.status == 1) {
        // 球的X大於磚塊的X。
        // 球的X小於磚塊的X加上它的寬。
        // 球的Y大於磚塊的Y。
        // 球的Y小於磚塊的Y加上它的高。
        // 判斷球碰到磚塊則反彈，並把status賦值為0，讓磚塊消失，並加一分
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score++;
          // 判斷如果分數與磚塊的數量相同，表示獲勝
          if (score == brickRowCount * brickColumnCount) {
            alert("YOU WIN, CONGRATULATIONS!");
            // 將球回到初始化位置，不然會一直跳出視窗
            x = canvas.width / 2;
            y = canvas.height - 30;
            document.location.reload();
          }
        }
      }
    }
  }
}
// 分數
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  // 參數第一個是分數本身、顯示在畫面的X及Y的座標
  ctx.fillText("Score: " + score, 8, 20);
}

// 生命
function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

setInterval(draw, 10);
