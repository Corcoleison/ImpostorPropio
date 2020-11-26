/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */

 function lanzarJuego(){
  game = new Phaser.Game(config);
 }

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

//const game = new Phaser.Game(config);
let cursors;
let player;
let jugadores;
let recursos = [{"nombre":"ana",frame=0},{nombre:"pepe",frame:3}];
let showDebug = false;

function preload() {
  this.load.image("tiles", "cliente/assets/tilesets/tuxmon-sample-32px-extruded.png");
  this.load.tilemapTiledJSON("map", "cliente/assets/tilemaps/tuxemon-town.json");

  // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
  // the player animations (walking left, walking right, etc.) in one image. For more info see:
  //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
  // If you don't use an atlas, you can do the same thing with a spritesheet, see:
  //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
  //this.load.atlas("atlas", "cliente/assets/atlas/atlas.png", "cliente/assets/atlas/atlas.json");
  //this.load.spritesheet("rojo","cliente/assets/images/personajeRojo.png",{frameWidth:32,frameHeight:32});
  //this.load.spritesheet("azul","cliente/assets/images/personajeAzul.png",{frameWidth:40,frameHeight:37});
  this.load.spritesheet("varios","cliente/assets/images/personajeRojo.png",{frameWidth:32,frameHeight:32});
  // repetir por cada personaje diferente
}

function create() {
  const map = this.make.tilemap({ key: "map" });

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
  const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
  const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

  worldLayer.setCollisionByProperty({ collides: true });

  // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // Higher depths will sit on top of lower depth objects.
  aboveLayer.setDepth(10);

  // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
  // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
  const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

  // Create a sprite with physics enabled via the physics system. The image used for the sprite has
  // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
  //player = this.physics.add
  //  .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
  //  .setSize(30, 40)
  //  .setOffset(0, 24);

  player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y,"varios",recursos[0].frame);

  // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.add.collider(player, worldLayer);
  let nombre=recursos[0].nombre;
  const anims = this.anims;
      anims.create({
        key: nombre+"-left-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 8,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: nombre+"-right-walk",
        frames: anims.generateFrameNames("rojo", {
          //prefix: "misa-left-walk.",
          start: 12,
          end: 15,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: nombre+"-front-walk",
        frames: anims.generateFrameNames("rojo", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 3,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: nombre+"-back-walk",
        frames: anims.generateFrameNames("rojo", {
          //prefix: "misa-left-walk.",
          start: 4,
          end: 7,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  const speed = 175;
  const prevVelocity = player.body.velocity.clone();

  // Stop any previous movement from the last frame
  player.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (cursors.left.isDown) {
    player.anims.play("rojo-left-walk", true);
  } else if (cursors.right.isDown) {
    player.anims.play("rojo-right-walk", true);
  } else if (cursors.up.isDown) {
    player.anims.play("rojo-back-walk", true);
  } else if (cursors.down.isDown) {
    player.anims.play("rojo-front-walk", true);
  } else {
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture("rojo", "rojo-left-walk");
    else if (prevVelocity.x > 0) player.setTexture("rojo", "rojo-right-walk");
    else if (prevVelocity.y < 0) player.setTexture("rojo", "rojo-back-walk");
    else if (prevVelocity.y > 0) player.setTexture("rojo", "rojo-front-walk");
  }
}
