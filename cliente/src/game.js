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

  let game;// = new Phaser.Game(config);
  let cursors;
  let player;
  let nombreMapa;
  let rutaTile;
  let rutaJson;
  //let player2;
  var jugadores=[]; //la coleccion de jugadores remotos
  let showDebug = false;
  let camera;
  var worldLayer;
  let map;
  var crear;
  var spawnPoint;
  var recursos=[{frame:0,sprite:"ana"},{frame:3,sprite:"pepe"},{frame:6,sprite:"tom"},{frame:36,sprite:"rayo"}];
  var remotos;
  var muertos;
  var listaMuertos={};
  var followText;
  var followTextRemoto=[];
  var followTextRemotoMuerto;
  var textHelp;
  var textEncargo;
  var textImpostor;
  var tareasOn=true;
  var ataquesOn=true;
  var votacionOn=true;
  var final=false;
  var musicaFondo;
  var musicaMuerto;
  var musicaReport;
  var musicaSierra;
  var volverBoton;
  var overCiudadanosImagen;
  var overImpostorImagen;
  var progresoLocalTexto;
  var progresoGlobalTexto;

  function elegirMapa(cadena){
    if (cadena=="rural"){
      //this.load.image("tiles", "cliente/assets/tilesets/segundo/tuxmon-sample-32px-extruded.png");
      //this.load.tilemapTiledJSON("map", "cliente/assets/tilemaps/segundo.json");
      rutaTile = "cliente/assets/tilesets/segundo/tuxmon-sample-32px-extruded.png";
      rutaJson = "cliente/assets/tilemaps/segundo.json";
      nombreMapa = "tuxmon-sample-32px-extruded";
    }else{
      //this.load.image("tiles", "cliente/assets/tilesets/pirata_medieval.png");
      //this.load.tilemapTiledJSON("map", "cliente/assets/tilemaps/Prueba.json");
      rutaTile = "cliente/assets/tilesets/pirata_medieval.png"
      rutaJson = "cliente/assets/tilemaps/Prueba.json"
      nombreMapa = "pirata_medieval";
    }
    console.log(nombreMapa);
    console.log(rutaTile);
    console.log(rutaJson);
  }

  function preload() {
    //this.load.image("tiles", "cliente/assets/tilesets/tuxmon-sample-32px-extruded.png");
    //this.load.tilemapTiledJSON("map", "cliente/assets/tilemaps/tuxemon-town.json");
    //this.load.image("tiles", "cliente/assets/tilesets/pirata_medieval.png");
    //this.load.tilemapTiledJSON("map", "cliente/assets/tilemaps/Prueba.json");
    //this.load.image("tiles", "cliente/assets/tilesets/segundo/tuxmon-sample-32px-extruded.png");
    //this.load.tilemapTiledJSON("map", "cliente/assets/tilemaps/segundo.json");
    console.log("El ws mapa que le llega al game js: ", ws.mapa);
    elegirMapa(ws.mapa);
    this.load.image("tiles", rutaTile);
    this.load.tilemapTiledJSON("map", rutaJson);



    // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
    // the player animations (walking left, walking right, etc.) in one image. For more info see:
    //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
    // If you don't use an atlas, you can do the same thing with a spritesheet, see:
    //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
    //this.load.atlas("atlas", "cliente/assets/atlas/atlas.png", "cliente/assets/atlas/atlas.json");
    //this.load.spritesheet("gabe","cliente/assets/images/gabe.png",{frameWidth:24,frameHeight:24});
    //this.load.spritesheet("gabe","cliente/assets/images/male01-2.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("varios","cliente/assets/images/guerreros.png",{frameWidth:32,frameHeight:43});
    this.load.spritesheet("muertos","cliente/assets/images/guerreros_muertos.png",{frameWidth:32,frameHeight:43});

    //musica
    this.load.audio('fondo', ['cliente/audio/musica_fondo.mp3', 'cliente/audio/musica_fondo.ogg']);
    this.load.audio('punch', ['cliente/audio/punch.mp3', 'cliente/audio/punch.ogg']);
    this.load.audio('report', ['cliente/audio/report.mp3', 'cliente/audio/report.ogg']);
    this.load.audio('sierra', ['cliente/audio/sierra.mp3', 'cliente/audio/sierra.ogg']);

    //fotos
    this.load.image('button', 'cliente/img/volverajugar.png');
    this.load.image('gameoverCiudadanos', 'cliente/img/gameover_ciudadanos.jpg');
    this.load.image('gameoverImpostor', 'cliente/img/gameover_impostor.jpg');
  }

  function create() {
    crear=this;
    map = crear.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    //const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");
    const tileset = map.addTilesetImage(nombreMapa, "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const decoracion = map.createStaticLayer("decoracion", tileset, 0, 0);
    const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    capaTareas = map.createStaticLayer("capaTareas", tileset, 0, 0);
    const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

    worldLayer.setCollisionByProperty({ collides: true });
    capaTareas.setCollisionByProperty({ collides: true });

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    aboveLayer.setDepth(10);
    decoracion.setDepth(11);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

    // Create a sprite with physics enabled via the physics system. The image used for the sprite has
    // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
    // player = this.physics.add
    //   .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
    //   .setSize(30, 40)
    //   .setOffset(0, 24);

    // // Watch the player and worldLayer for collisions, for the duration of the scene:
    //this.physics.add.collider(player, worldLayer);

     const anims = crear.anims;
      anims.create({
        key: "gabe-left-walk",
        frames: anims.generateFrameNames("gabe", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: "gabe-right-walk",
        frames: anims.generateFrameNames("gabe", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: "gabe-front-walk",
        frames: anims.generateFrameNames("gabe", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: "gabe-back-walk",
        frames: anims.generateFrameNames("gabe", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims2 = crear.anims;
      anims2.create({
        key: "ana-left-walk",
        frames: anims.generateFrameNames("varios", {
          start: 27,
          end: 29,
        }),
        repeat: -1
      });
      anims2.create({
        key: "ana-right-walk",
        frames: anims.generateFrameNames("varios", {
          start: 9,
          end: 11,
        }),
        repeat: -1
      });
      anims2.create({
        key: "ana-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 18,
          end: 20,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims2.create({
        key: "ana-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims3 = crear.anims;
      anims3.create({
        key: "pepe-left-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 30,
          end: 32,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims3.create({
        key: "pepe-right-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 12,
          end: 14,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims3.create({
        key: "pepe-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 21,
          end: 23,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims3.create({
        key: "pepe-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims4 = crear.anims;
      anims4.create({
        key: "tom-left-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 33,
          end: 35,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims4.create({
        key: "tom-right-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 15,
          end: 17,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims4.create({
        key: "tom-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 24,
          end: 26,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims4.create({
        key: "tom-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims5 = crear.anims;
      anims5.create({
        key: "rayo-left-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 63,
          end: 65,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims5.create({
        key: "rayo-right-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 45,
          end: 47,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims5.create({
        key: "rayo-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 54,
          end: 56,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims5.create({
        key: "rayo-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 36,
          end: 38,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

    // const camera = this.cameras.main;
    // camera.startFollow(player);
    // camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    cursors = crear.input.keyboard.createCursorKeys();
    remotos = crear.add.group();
    muertos = crear.add.group();
    teclaA=crear.input.keyboard.addKey('a');
    teclaV=crear.input.keyboard.addKey('v');
    teclaT=crear.input.keyboard.addKey('t');
    teclaH=crear.input.keyboard.addKey('h');
    teclaM=crear.input.keyboard.addKey('m');
    teclaESC=crear.input.keyboard.addKey('esc');
    lanzarJugador(ws.nick,ws.numJugador,ws.numJugador);
    ws.estoyDentro();

    //this.input.keyboard.on('keydown_ESC', this.pausarPartida(), this);

    //musica
    musicaFondo = this.sound.add("fondo", { loop: true, volume:0.1 });
    musicaFondo.play();

    musicaMuerto = this.sound.add("punch", { volume:0.1 });
    musicaReport = this.sound.add("report", { volume:0.6 });
    musicaSierra = this.sound.add("sierra", { volume:0.1 });



  }

 

  // pausarPartida(){
  //   cw.mostrarModalAbandonar();
  // }

  function crearColision(){
    if (crear && ws.impostor){
      crear.physics.add.overlap(player,remotos,kill,()=>{return ataquesOn});
    }
  }

  function kill(sprite, inocente){
    //dibujar el inocente muerto
    //avisar del ataque
    //console.log("atacando a ", inocente);
    var nick = inocente.nick;
    if(teclaA.isDown){
      ataquesOn = false;
      ws.atacar(nick);
      musicaMuerto.play();
    }
  }

  function dibujarMuereInocente(inocente){
    var x=jugadores[inocente].x;
    var y=jugadores[inocente].y;
    var numJugador = jugadores[inocente].numJugador;

    if(ws.nick != inocente){
      jugadores[inocente].setActive(false).setVisible(false);
      followTextRemoto[numJugador].setActive(false).setVisible(false);
    }


    
    if(!listaMuertos[inocente]){
      var muerto = crear.physics.add.sprite(x, y,"muertos",recursos[numJugador].frame);
      muerto.nick = inocente;
      listaMuertos[inocente]=muerto;
      followTextRemotoMuerto = crear.add.text(0, 0, jugadores[inocente].nick);
      followTextRemotoMuerto.setPosition(x-20, y-30);
      followTextRemotoMuerto.setColor("#8b0000");
      listaMuertos[inocente].titulo=followTextRemotoMuerto;

      muertos.add(muerto);

      //jugadores[inocente].setTexture("muertos",recursos[numJugador].frame);
      //otra alternativa = añadir jugadores[inocente] al grupo muertos
      //

      crear.physics.add.overlap(player,muertos,votacion, ()=>{return votacionOn});

    }
    
  }

  function votacion(sprite,muerto){
    //comprobar si el jugador local pulsa la tecla de votacion "v"
    //en ese caso, llamamos al servidor
    if(teclaV.isDown){
      votacionOn = false;
      ws.lanzarVotacion();
      ws.limpiarMuerto(muerto.nick);
      //muertos.remove(muerto, true); //Así quitamos el cadaver (pero de momento solo en el que lanza la votacion)
    }
  }

  function reproducirSonidoVotacion(){
    musicaReport.play();
  }

  function borrarMuerto(nickMuerto){
    //console.log("NickMuerto en borrar Muerto de gamejs: ",nickMuerto);
    if(listaMuertos[nickMuerto]){
      listaMuertos[nickMuerto].setActive(false).setVisible(false);
      listaMuertos[nickMuerto].titulo.setActive(false).setVisible(false);
      //muertos.killAndHide(listaMuertos["player2"])
      //listaMuertos["player2"].setActive(false).setVisible(false);
    }
    
  }

  function tareas(sprite,objeto){
    if (ws.encargo==objeto.properties.tarea && teclaT.isDown && !ws.impostor){
      tareasOn=false;
      console.log("realizar tarea "+ws.encargo);
      ws.realizarTarea();  //o hacer la llamada dentro de cw
      musicaSierra.play();
      cw.mostrarModalTarea(ws.encargo);
      tareasOn=true;
    }    
  }

  function actualizarValoresTareas(percentGlobal, percentLocal){
    if(!ws.impostor){
      progresoGlobalTexto.setText("Progreso Global: "+percentGlobal+"%");
      progresoLocalTexto.setText("Progreso Local: "+percentLocal+"%");
    }
  }

  function actualizarValoresTareasGlobal(percentGlobal){
    if(!ws.impostor){
      progresoGlobalTexto.setText("Progreso Global: "+percentGlobal+"%");
    }
  }

  function lanzarJugador(nick,numJugador){
    var x = spawnPoint.x+numJugador*32*2;
    player = crear.physics.add.sprite(x, spawnPoint.y,"varios",recursos[numJugador].frame);
    // Watch the player and worldLayer for collisions, for the duration of the scene:
    crear.physics.add.collider(player, worldLayer);
    crear.physics.add.collider(player, capaTareas, tareas,()=>{return tareasOn});
    //crear.physics.add.collider(player2, worldLayer);
    jugadores[nick] = player;
    jugadores[nick].nick = nick;
    jugadores[nick].numJugador = numJugador;
    camera = crear.cameras.main;
    camera.startFollow(player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.setZoom(2);
    //camera.setSize(200);
    //Textos
    this.followText = crear.add.text(0, 0, jugadores[nick].nick);
    followText.setDepth(13);
    this.textHelp = crear.add.text(0, 0, "Pulsa H para Ayuda");
    textHelp.setStyle({
    fontSize: '14px',
    fontFamily: 'Arial',
    color: '#ffffff'});
    textHelp.setDepth(13);
    encargo = ws.encargo
    if(ws.impostor){
      encargo = "impostor";
    }
    this.textEncargo = crear.add.text(0, 0, "Tarea: "+encargo+"");
    textEncargo.setStyle({
    fontSize: '14px',
    fontFamily: 'Arial',
    color: '#ffffff'});
    textEncargo.setDepth(13);
    if(!ws.impostor){
      this.progresoGlobalTexto = crear.add.text(0, 0, "Progreso Global: "+0+"%");
      progresoGlobalTexto.setStyle({
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#ffffff'});
      progresoGlobalTexto.setDepth(13);
      this.progresoLocalTexto = crear.add.text(0, 0, "Progreso Local: "+0+"%");
      progresoLocalTexto.setStyle({
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#ffffff'});
      progresoLocalTexto.setDepth(13);
    }
  }

  function lanzarJugadorRemoto(nick, numJugador){
    var x = spawnPoint.x+numJugador*32*2;
    var frame = recursos[numJugador].frame;
    jugadores[nick]=crear.physics.add.sprite(x, spawnPoint.y,"varios",frame);   
    crear.physics.add.collider(jugadores[nick], worldLayer);
    jugadores[nick].nick = nick;
    jugadores[nick].numJugador = numJugador;
    remotos.add(jugadores[nick]);
    this.followTextRemoto[numJugador] = crear.add.text(0, 0, jugadores[nick].nick);
    this.followTextRemoto[numJugador].setDepth(13);
  }

  function mover(datos)
  {
    var direccion = datos.direccion;
    var nick = datos.nick
    var numJugador = datos.numJugador;
    var x = datos.x;
    var y = datos.y;
    var remoto=jugadores[nick];
    const speed = 175;
    //const prevVelocity = player.body.velocity.clone();
    const nombre=recursos[numJugador].sprite;
   if (remoto && !final)
    {
      remoto.body.setVelocity(0);
      remoto.setX(x);
      remoto.setY(y);
      remoto.body.velocity.normalize().scale(speed);
      if (direccion=="left") {
        remoto.anims.play(nombre+"-left-walk", true);
      } else if (direccion=="right") {
        remoto.anims.play(nombre+"-right-walk", true);
      } else if (direccion=="up") {
        remoto.anims.play(nombre+"-back-walk", true);
      } else if (direccion=="down") {
        remoto.anims.play(nombre+"-front-walk", true);
      } else {
        remoto.anims.stop();
      }
      this.followTextRemoto[numJugador].setPosition(remoto.x-30, remoto.y-40);
    }
    
  }

  function finPartida(data){
    final=true;
    //remoto = undefined;
    //cw.mostrarModalSimple("Fin de la partida... Ganan: "+data);
    musicaFondo.stop();
    if(data == "impostores"){
      this.overImpostorImagen = crear.add.sprite(50,50, 'gameoverImpostor');
      screenCenterX = crear.cameras.main.worldView.x + crear.cameras.main.width / 2;
      screenCenterY = crear.cameras.main.worldView.y + crear.cameras.main.height / 2;
      this.overImpostorImagen.setPosition(screenCenterX-200, screenCenterY-80);
      this.overImpostorImagen.setDepth(13);
    }else{
      this.overCiudadanosImagen = crear.add.sprite(50,50, 'gameoverCiudadanos');
      screenCenterX = crear.cameras.main.worldView.x + crear.cameras.main.width / 2;
      screenCenterY = crear.cameras.main.worldView.y + crear.cameras.main.height / 2;
      this.overCiudadanosImagen.setPosition(screenCenterX-200, screenCenterY-80);
      this.overCiudadanosImagen.setDepth(13);
    }
    this.volverBoton = crear.add.sprite(100, 100, 'button').setInteractive();
    this.volverBoton.setDepth(17);
    this.volverBoton.setPosition(camera.worldView.x+220, camera.worldView.y+155);
    this.volverBoton.on('pointerdown', reiniciarPagina); // Start game on click.

  }

  function reiniciarPagina(){
    cw.reiniciarPagina();
  }

  function update(time, delta) {
    var direccion="stop";
    const speed = 175;
    //const prevVelocity = player.body.velocity.clone();

    const nombre=recursos[ws.numJugador].sprite;
    if(!final){
      // Stop any previous movement from the last frame
      player.body.setVelocity(0);
      //player2.body.setVelocity(0);

      // Horizontal movement
      if (cursors.left.isDown) {
        player.body.setVelocityX(-speed);
        //ws.movimiento("left");
        direccion="left";
      } else if (cursors.right.isDown) {
        player.body.setVelocityX(speed);
        //ws.movimiento("right");
        direccion="right";
      }

      // Vertical movement
      if (cursors.up.isDown) {
        player.body.setVelocityY(-speed);
        //ws.movimiento("up");
        direccion="up";
      } else if (cursors.down.isDown) {
        player.body.setVelocityY(speed);
        //ws.movimiento("down");
        direccion="down";
      }
      followText.setPosition(player.x-30, player.y-40);
      textHelp.setPosition(camera.worldView.x, camera.worldView.y);
      textEncargo.setPosition(camera.worldView.x+295, camera.worldView.y);
      if(!ws.impostor){
        progresoLocalTexto.setPosition(camera.worldView.x+287, camera.worldView.y+15);
        progresoGlobalTexto.setPosition(camera.worldView.x+287, camera.worldView.y+25);
      }
      ws.movimiento(direccion,player.x,player.y);

      // Normalize and scale the velocity so that player can't move faster along a diagonal
      player.body.velocity.normalize().scale(speed);

      // Update the animation last and give left/right animations precedence over up/down animations
      if (cursors.left.isDown) {
        player.anims.play(nombre+"-left-walk", true);
      } else if (cursors.right.isDown) {
        player.anims.play(nombre+"-right-walk", true);
      } else if (cursors.up.isDown) {
        player.anims.play(nombre+"-back-walk", true);
      } else if (cursors.down.isDown) {
        player.anims.play(nombre+"-front-walk", true);
      } else {
        player.anims.stop();
        // If we were moving, pick and idle frame to use
        // if (prevVelocity.x < 0) player.setTexture("gabe", "gabe-left-walk");
        // else if (prevVelocity.x > 0) player.setTexture("gabe", "gabe-right-walk");
        // else if (prevVelocity.y < 0) player.setTexture("gabe", "gabe-back-walk");
        // else if (prevVelocity.y > 0) player.setTexture("gabe", "gabe-front-walk");
      }

      if(teclaESC.isDown){
        cw.mostrarModalAbandonar();
      }

      if(teclaH.isDown){
        cw.mostrarModalSimple("Tecla A para Atacar (Solo impostor). Tecla T para realizar las tareas. Tecla V para votacion en cadaver. Tecla M para ver el Mapa. Tecla ESC para abandonar partida.");
      }

      if(teclaM.isDown){
        cw.mostrarModalMapa(ws.mapa);
      }


  }else{
    //volverBoton.setPosition(camera.worldView.x+220, camera.worldView.y+155);
    player.body.setVelocity(0);
  }
  
  }