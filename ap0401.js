//
// 応用プログラミング 第4回 課題 (ap0401)
// G284092022 五十嵐健翔
//
"use strict"; // 厳格モード

import * as THREE from 'three';
import GUI from 'ili-gui';
import { MeshPhongMaterial } from 'three';

// ３Ｄページ作成関数の定義
function init() {
  const param = { // カメラの設定値
    fov: 60, // 視野角
    x: 0,
    y: 25,
    z: 10,
    nRow: 6, /* ブロックの行数 */
    nCol: 9, /* ブロックの列数 */
    axes: false,
  };

  // シーン作成
  const scene = new THREE.Scene();

  // 座標軸の設定
  const axes = new THREE.AxesHelper(18);
  scene.add(axes);

  // ブロック数のカウント
  let nBrick = 0

  // スコア表示
  let score = 0;
  let life = 3;
  function setScore(score) {
    document.getElementById("score").innerText
    =String(Math.round(score)).padStart(8,"0");
    document.getElementById("life").innerText
    =(life>0) ? "○○○".substring(0,life):"-- Game Over --";
  }

  // Geometry の分割数
  const nSeg = 24;
  const pi = Math.PI;

  // ボール ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
  // ボールの作成
  const ballR = 0.3;
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(ballR, nSeg, nSeg),
    new THREE.MeshPhongMaterial({ color: 0x808080, shininess: 100, specular: 0xa0a0a0 })
  );
  ball.geometry.computeBoundingSphere();
  scene.add(ball);

  // ボールの移動
  const vBall = new THREE.Vector3();
  let vx = Math.sin(pi / 4);
  let vz = -Math.cos(pi / 4);

  function moveBall(delta) {
    if(ballLive){
      vBall.set(vx,0,vz);
      ball.position.addScaledVector(vBall,delta*speed);
    }else{
      ball.position.x=paddle.position.x;
      ball.position.z=paddle.position.z-paddleR-ballR;
    }
  }

  // ボールの死活
  let ballLive = false;
  let speed = 0;

  // ボールを停止する
  function stopBall() {
    speed=0;
    ballLive = false;
    life--;
    if(life<=0){
      resetBrick();
    }
  }

  // ボールを動かす
  function startBall() {
    ballLive = true;
    speed = 10;
    if(life<=0){
      life=3;
      score=0;
    }
  }

  // マウスクリックでスタートする
  window.addEventListener("mousedown", () => {
    if (!ballLive) { startBall(); }
  }, false);

  // 外枠 ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
  // 枠の作成
  //   大きさの定義
  const hFrameW = 13;  const hFrameH = 2;  const hFrameD = 1;
  const vFrameW = 0.5;  const vFrameH = 1.2;  const vFrameD = 22;
  {
    //   上の枠
    const tFrame = new THREE.Mesh(
      new THREE.BoxGeometry(hFrameW, hFrameH, hFrameD),
      new THREE.MeshPhongMaterial({ color: 0x333333 })
    );
    tFrame.position.z = -(vFrameD + hFrameD) / 2;
    scene.add(tFrame);
    //   下の枠
    const bFrame = tFrame.clone();
    bFrame.position.z = (vFrameD + hFrameD) / 2;
    scene.add(bFrame);
    //   左の枠
    const lFrame = new THREE.Mesh(
      new THREE.BoxGeometry(vFrameW, vFrameH, vFrameD),
      new MeshPhongMaterial({ color: 0xB3B3B3 })
    );
    lFrame.position.x=-hFrameW/2+vFrameW/2;
    scene.add(lFrame);
    //   右の枠
    const rFlame = lFrame.clone();
    rFlame.position.x=(hFrameW/2-vFrameW/2);
    scene.add(rFlame);
  }

  // 壁で反射させる
  const hLimit = hFrameW / 2 - vFrameW;
  const vLimit = vFrameD / 2;
  function frameCheck() {
    // 右
    if(ball.position.x+ballR>hLimit){
      ball.position.x=hLimit-ballR;
      vx = -Math.abs(vx);
    }
    // 左
    if(ball.position.x-ballR<-hLimit){
      ball.position.x=-hLimit+ballR;
      vx = Math.abs(vx);
    }
    // 上
    if(ball.position.z-ballR<-vLimit){
      ball.position.z= -vLimit+ballR;
      vz =Math.abs(vz);
    }
    // 下
    if(ball.position.z+ballR>vLimit){
      // ball.position.z=vLimit-ballR;
      // vz = -Math.abs(vz);
      stopBall();
    }
  }

  // パドル ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
  // パドルの作成
  const paddleR = 0.3;
  const paddleL = 1.5;
  const paddle = new THREE.Group(); // パドルグループ
  {
    // パドル中央
    const center = new THREE.Mesh(
      new THREE.CylinderGeometry(paddleR, paddleR, paddleL, nSeg),
      new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 100, specular: 0x404040 })
    );
    center.rotation.z=Math.PI/2;
    paddle.add(center);
    // パドル端
    const sideGeometry
      = new THREE.SphereGeometry(paddleR, nSeg, nSeg, Math.PI / 2, Math.PI);
    const sideMaterial
      = new THREE.MeshPhongMaterial({ color: 0x666666, shininess: 100, specular: 0xa0a0a0 })
    // パドル端(右)
    const right = new THREE.Mesh(sideGeometry,sideMaterial);
    right.position.x=paddleL/2;
    paddle.add(right);
    // パドル端(左)
    const light = right.clone();
    light.position.x=-paddleL/2;
    light.rotation.z=Math.PI;
    paddle.add(light);
    // パドルの配置
    paddle.position.z=0.4*vFrameD;
    scene.add(paddle);
  }
  

  // パドル操作
  {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const intersects = new THREE.Vector3();
    function paddleMove(event) {
      mouse.x=(event.clientX / window.innerWidth)*2-1;
      raycaster.setFromCamera(mouse,camera);
      raycaster.ray.intersectPlane(plane,intersects);
      const offset = hFrameW/2 - vFrameW - paddleL/2 - paddleR;
      if(intersects.x<-offset){
        intersects.x = -offset;
      }else if(intersects.x>offset){
        intersects.x = offset;
      }
      paddle.position.x = intersects.x;
    }
    window.addEventListener("mousemove", paddleMove, false);
  }

  // パドルの衝突検出
  function paddleCheck() {
    if(Math.abs(ball.position.z - paddle.position.z)<paddleR+ballR&&
       Math.abs(ball.position.x - paddle.position.x)<paddleL/2+ballR){
        //中央部分衝突
        if(ball.position.z < paddle.position.z){
          vz=-Math.abs(vz);
        }
        //右側部分衝突
        if(ball.position.x > paddle.position.x+paddleL/2){
          vx = Math.abs(vx);
        }
        //左側部分衝突
        else if(ball.position.x < paddle.position.x-paddleL/2){
          vx = -Math.abs(vx);
        }
        if(nBrick <=0){
          resetBrick();
        }
       }
  }

  // ブロック ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
  // ブロックの生成
  const bricks = new THREE.Group();
  function makeBricks(){
    const color = ["white", "red", "yellow", "blue", "purple", "green"];
    const h = 0.8; /* ブロックの高さ */
    const d = 0.4; /* ブロックの奥行 */
    const gapX = 0.1; /* 横方向の隙間 */
    const gapZ = 0.3; /* 縦方向の隙間 */

    // ブロックの幅
    const w = (hFrameW - 2 * vFrameW - (param.nCol + 1) * gapX) / param.nCol;
    // ブロックを並べる
    for(let r=0;r<param.nRow;r++){
      for(let c=0;c<param.nCol;c++){
        const brick = new THREE.Mesh(
          new THREE.BoxGeometry(w,h,d),
          new THREE.MeshLambertMaterial({color:color[r%color.length]})
        );
        brick.position.set(
          (w+gapX)*(c-(param.nCol-1)/2),
          0,
          -(d+gapZ)*r
        )
        brick.geometry.computeBoundingBox();
        bricks.add(brick);
        nBrick++;
      }
    }
    // ブロック全体を奥に移動する
    
    bricks.position.z=-4;
    scene.add(bricks);
  }
  makeBricks();

  // ブロックの衝突検出
  function brickCheck() {
    let hit = false;
    const sphere = ball.geometry.boundingSphere.clone();
    sphere.translate(ball.position);
    bricks.children.forEach((brick) => {
      if(!hit && brick.visible){
        let box = brick.geometry.boundingBox.clone();
        box.translate(bricks.position);
        box.translate(brick.position);
        if(box.intersectsSphere(sphere)){
          hit=true;
          brick.visible = false;
          nBrick--;
          score += (-brick.position.z/0.7+1)*100;
          vz = -vz;
        }
      }
    });
  }
  //ブロックの作り直し
  function remakeBricks(){
    stopBall();
    scene.remove(bricks);
    bricks.clear();
    nBrick=0;
    makeBricks();
    scene.add(bricks);
  }
  // ブロックの再表示
  function resetBrick() {
    nBrick = 0;
    bricks.children.forEach((brick)=>{
      brick.visible = true;
      nBrick++;
    });
  }

  // 光源の設定
  const light = new THREE.SpotLight(0xffffff, 1000);
  light.position.set(0, 15, -10);
  scene.add(light);

  // カメラの設定
  const camera = new THREE.PerspectiveCamera(
    param.fov, window.innerWidth / window.innerHeight, 0.1, 1000);

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x305070);
  document.getElementById("WebGL-output")
    .appendChild(renderer.domElement);

  // 描画更新
  const clock = new THREE.Clock(); // 時間の管理
  function render(time) {
    // カメラの再設定
    camera.fov = param.fov;
    camera.position.x = param.x;
    camera.position.y = param.y;
    camera.position.z = param.z;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    // 座標軸の表示
    axes.visible = param.axes;
    // ゲーム画面の更新
    let delta = clock.getDelta(); // 経過時間の取得
    frameCheck(); // 枠の衝突判定
    paddleCheck(); // パドルの衝突判定
    brickCheck(); // ブロックの衝突判定
    moveBall(delta); // ボールの移動
    setScore(score); // スコア更新
    // 再描画
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  // GUIコントローラ
  const gui = new GUI();
  gui.add(param, "fov", 10, 100);
  gui.add(param, "x", -40, 80);
  gui.add(param, "y", -40, 80);
  gui.add(param, "z", -40, 80);
  gui.add(param, "axes");
  gui.add(param,"nRow",1,10,1).onChange(remakeBricks);
  gui.add(param,"nCol",1,10,1).onChange(remakeBricks);
  gui.close();
  // 描画
  render();
}

// 3Dページ作成関数の呼び出し
init();
