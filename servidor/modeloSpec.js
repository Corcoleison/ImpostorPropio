var modelo=require("./modelo.js");

describe("El juego del impostor", function() {
	var juego;
	//var usr;
	var nick;

	beforeEach(function() {
		juego = new modelo.Juego();
		//usr = new modelo.Usuario("pepe",juego);
		nick="pepe";
	});

	it("Comprobar valores iniciales", function() {
		expect(Object.keys(juego.partidas).length).toEqual(0);
		expect(nick).toEqual("pepe");
		expect(juego).not.toBe(undefined);
	});

	it("Comprobar valores de la partida", function() {
		codigo=juego.crearPartida(3, nick);
		expect(codigo).toEqual("Error");
		codigo=juego.crearPartida(11, nick);
		expect(codigo).toEqual("Error");
	});

	describe("cuando el usuario pepe crea una partida de 4 jugadores", function() {
		beforeEach(function() {
			nick = "pepe";
			codigo=juego.crearPartida(4, nick);
			fase = new modelo.Inicial();
			partida = juego.partidas[codigo];
		});

		it("el usr Pepe crea una partida de 4 jugadores", function() {
			expect(codigo).not.toBe(undefined);
			expect(partida.nickOwner==nick).toBe(true);
			expect(partida.fase.nombre=="inicial").toBe(true);
			expect(partida.maximo==4).toBe(true);
			expect(Object.keys(partida.usuarios).length==1).toBe(true);
		});

		it("3 usuario se unen mediante unirAPartida de partida", function() {
			juego.unirAPartida(codigo, "pepe");
			expect(Object.keys(partida.usuarios).length==2).toBe(true);
			juego.unirAPartida(codigo, "pepe");
			expect(Object.keys(partida.usuarios).length==3).toBe(true);
			juego.unirAPartida(codigo, "pepe");
			expect(Object.keys(partida.usuarios).length==4).toBe(true);
			expect(partida.usuarios["pepe"]).not.toBe(undefined);
			expect(partida.usuarios["pepe1"]).not.toBe(undefined);
			expect(partida.usuarios["pepe2"]).not.toBe(undefined);
			expect(partida.usuarios["pepe3"]).not.toBe(undefined);
			expect(partida.usuarios["pepe4"]).toBe(undefined);
		});


		it("El creador inicia la partida", function() {
			juego.unirAPartida(codigo, "pepe");
			expect(Object.keys(partida.usuarios).length==2).toBe(true);
			juego.unirAPartida(codigo, "pepe");
			expect(Object.keys(partida.usuarios).length==3).toBe(true);
			juego.unirAPartida(codigo, "pepe");
			expect(Object.keys(partida.usuarios).length==4).toBe(true);
			juego.iniciarPartida(codigo, nick);
			expect(partida.fase.nombre=="jugando").toBe(true);
		});

		describe("Creacion de 3 usuarios, uniones y abandonos", function() {
			beforeEach(function() {
				codigo=juego.crearPartida(4, nick);
				fase = new modelo.Inicial();
				partida = juego.partidas[codigo];
				usrpablo = new modelo.Usuario("pablo",juego);
				usrtomas = new modelo.Usuario("tomas",juego);
				usrjose = new modelo.Usuario("jose",juego);
			});

			it("Se crean 3 usuarios y se unen con usr.unirAPartida(codigo)", function() {
				juego.unirAPartida(codigo, "pablo");
				expect(Object.keys(partida.usuarios).length==2).toBe(true);
				juego.unirAPartida(codigo, "tomas");
				expect(Object.keys(partida.usuarios).length==3).toBe(true);
				juego.unirAPartida(codigo, "jose");
				expect(Object.keys(partida.usuarios).length==4).toBe(true);
				expect(partida.usuarios["pablo"]).not.toBe(undefined);
				expect(partida.usuarios["tomas"]).not.toBe(undefined);
				expect(partida.usuarios["jose"]).not.toBe(undefined);
				expect(partida.usuarios["pablo"].encargo).toEqual("ninguno");
				expect(partida.usuarios["tomas"].encargo).toEqual("ninguno");
				expect(partida.usuarios["jose"].encargo).toEqual("ninguno");
			});

			it("3 usuarios de una partida sin iniciar, la abandonan", function() {
				juego.unirAPartida(codigo, "pablo");
				expect(Object.keys(partida.usuarios).length==2).toBe(true);
				juego.unirAPartida(codigo, "tomas");
				expect(Object.keys(partida.usuarios).length==3).toBe(true);
				juego.unirAPartida(codigo, "jose");
				expect(Object.keys(partida.usuarios).length==4).toBe(true);
				expect(partida.usuarios["pablo"]).not.toBe(undefined);
				expect(partida.usuarios["tomas"]).not.toBe(undefined);
				expect(partida.usuarios["jose"]).not.toBe(undefined);
				expect(partida.usuarios["pepe"]).not.toBe(undefined);
				partida.usuarios["pablo"].abandonarPartida();
				expect(Object.keys(partida.usuarios).length==3).toBe(true);
				partida.usuarios["tomas"].abandonarPartida();
				expect(Object.keys(partida.usuarios).length==2).toBe(true);
				partida.usuarios["jose"].abandonarPartida();
				expect(Object.keys(partida.usuarios).length==1).toBe(true);
				partida.usuarios["pepe"].abandonarPartida();
				expect(partida.usuarios["pablo"]).toBe(undefined);
				expect(partida.usuarios["tomas"]).toBe(undefined);
				expect(partida.usuarios["jose"]).toBe(undefined);
				expect(partida.usuarios["pepe"]).toBe(undefined);
				//no existe
				//juego.eliminarPartida(codigo);
				expect(juego.partidas[codigo]).toBe(undefined);
			});

			it("3 usuarios de una partida ya iniciada, la abandonan", function() {
				juego.unirAPartida(codigo, "pablo");
				expect(Object.keys(partida.usuarios).length==2).toBe(true);
				juego.unirAPartida(codigo, "tomas");
				expect(Object.keys(partida.usuarios).length==3).toBe(true);
				juego.unirAPartida(codigo, "jose");
				expect(Object.keys(partida.usuarios).length==4).toBe(true);
				expect(partida.usuarios["pablo"]).not.toBe(undefined);
				expect(partida.usuarios["tomas"]).not.toBe(undefined);
				expect(partida.usuarios["jose"]).not.toBe(undefined);
				expect(partida.fase.nombre=="completado").toBe(true);
				juego.iniciarPartida(codigo, nick);
				expect(partida.fase.nombre=="jugando").toBe(true);
				expect(partida.usuarios["pablo"].encargo).not.toEqual("ninguno");
				expect(partida.usuarios["tomas"].encargo).not.toEqual("ninguno");
				expect(partida.usuarios["jose"].encargo).not.toEqual("ninguno");
				partida.usuarios["pablo"].abandonarPartida();
				expect(Object.keys(partida.usuarios).length==3).toBe(true);
				partida.usuarios["tomas"].abandonarPartida();
				expect(partida.fase.nombre=="inicial").toBe(true);
				expect(Object.keys(partida.usuarios).length==2).toBe(true);
				partida.usuarios["jose"].abandonarPartida();
				partida.usuarios["pepe"].abandonarPartida();
				expect(partida.numJugadores()).toEqual(0);
				juego.eliminarPartida(codigo);
				expect(juego.partidas[codigo]).toBe(undefined);
			});
		});

		describe("Durante la partida", function() {
			beforeEach(function() {
				juego.unirAPartida(codigo, "pablo");
				juego.unirAPartida(codigo, "tomas");
				juego.unirAPartida(codigo, "jose");
				juego.iniciarPartida(codigo, nick);
				usuarios = partida.codigo.usuarios;
				numImpostores = partida.numImpostoresVivos(); //asi sabemos quien es el impostor
				//he creado este metodo porque se podia atacar a si mismo y nadie moriria por la
				//condicion que le he puesto de que no ataque a si mismo
				ciudadanos = partida.devolverCiudadanosVivos();
				impostor = partida.identificarImpostor();
			});

			// it("Comprobar que hay un impostor", function() {
			// 	expect(numImpostores).not.toEqual(0);
			// });

			// it("El impostor ataca, muere un ciudadano", function() {
			// 	expect(partida.usuarios["pepe"].estado.nombre).toEqual("vivo");
			// 	//Lo he tenido que hacer de esta manera porque como la asignacion de impostor es al azar
			// 	//puede atacarse a si mismo en algun momento y fallaria el test
			// 	impostor.atacar(ciudadanos[0].nick); 
			// 	expect(partida.usuarios[ciudadanos[0].nick].estado.nombre).toEqual("muerto");
			// });

			// it("ganan impostores", function() {
			// 	expect(partida.usuarios["pepe"].estado.nombre).toEqual("vivo");
			// 	expect(partida.usuarios["pablo"].estado.nombre).toEqual("vivo");
			// 	expect(partida.usuarios["tomas"].estado.nombre).toEqual("vivo");
			// 	expect(partida.usuarios["jose"].estado.nombre).toEqual("vivo");
			// 	impostor = partida.identificarImpostor();
			// 	//Da igual que ataque a todos, puesto que no sabemos ahora mismo quien es el impostor, 
			// 	//le he puesto una condicion para que no se ataque a si mismo en el metodo Atacar
			// 	impostor.atacar("pepe");
			// 	impostor.atacar("pablo");
			// 	impostor.atacar("tomas");
			// 	impostor.atacar("jose");
			// 	expect(partida.fase.nombre).toEqual("final");
			// 	expect(partida.fase.ganadores).toEqual("impostores");
			// });
			// it("votaciones: todos saltan el voto, nadie muere, la partida sigue", function() {
			// 	expect(partida.fase.nombre).toEqual("jugando");
			// 	expect(partida.usuarios["pepe"].estado.nombre).toEqual("vivo");
			// 	expect(partida.usuarios["pablo"].estado.nombre).toEqual("vivo");
			// 	expect(partida.usuarios["tomas"].estado.nombre).toEqual("vivo");
			// 	expect(partida.usuarios["jose"].estado.nombre).toEqual("vivo");
			// 	partida.comenzarVotacion();
			// 	expect(partida.fase.nombre).toEqual("votacion");
			// 	partida.usuarios["pepe"].skipear();
			// 	expect(partida.usuarios["pepe"].skip).toBe(true);
			// 	partida.usuarios["pablo"].skipear();
			// 	expect(partida.usuarios["pablo"].skip).toBe(true);
			// 	partida.usuarios["tomas"].skipear();
			// 	expect(partida.usuarios["tomas"].skip).toBe(true);
			// 	partida.usuarios["jose"].skipear();
			// 	expect(partida.usuarios["jose"].skip).toBe(true);
			// 	expect(partida.numImpostoresVivos()).toEqual(1);
			// 	expect(partida.numCiudadanosVivos()).toEqual(3);
			// 	expect(partida.gananCiudadanos()).toBe(false);
			// 	expect(partida.gananImpostores()).toBe(false);
			// 	partida.eliminarMasVotado();
			// 	expect(partida.numImpostoresVivos()).toEqual(1);
			// 	expect(partida.numCiudadanosVivos()).toEqual(3);
			// 	expect(partida.gananCiudadanos()).toBe(false);
			// 	expect(partida.gananImpostores()).toBe(false);
			// 	expect(partida.fase.nombre).toEqual("jugando");
			// 	expect(partida.usuarios["pepe"].skip).toBe(false);
			// 	expect(partida.usuarios["pablo"].skip).toBe(false);
			// 	expect(partida.usuarios["tomas"].skip).toBe(false);
			// 	expect(partida.usuarios["jose"].skip).toBe(false);
			// 	expect(partida.usuarios["pepe"].estado.nombre).toEqual("vivo");
			// 	expect(partida.usuarios["pablo"].estado.nombre).toEqual("vivo");
			// 	expect(partida.usuarios["tomas"].estado.nombre).toEqual("vivo");
			// 	expect(partida.usuarios["jose"].estado.nombre).toEqual("vivo");
			// });
			// it("votaciones: impostor pillado, la partida termina, gana el pueblo", function() {
			// 	expect(partida.fase.nombre).toEqual("jugando");
			// 	expect(partida.usuarios["pepe"].estado.nombre).toEqual("vivo");
			// 	expect(partida.usuarios["pablo"].estado.nombre).toEqual("vivo");
			// 	expect(partida.usuarios["tomas"].estado.nombre).toEqual("vivo");
			// 	expect(partida.usuarios["jose"].estado.nombre).toEqual("vivo");
			// 	partida.comenzarVotacion();
			// 	expect(partida.fase.nombre).toEqual("votacion");
			// 	ciudadanos[0].votar(impostor.nick);
			// 	expect(ciudadanos[0].skip).toBe(false);
			// 	expect(ciudadanos[0].haVotado).toBe(true);
			// 	expect(impostor.votos).toEqual(1);
			// 	ciudadanos[1].votar(impostor.nick);
			// 	expect(ciudadanos[1].haVotado).toBe(true);
			// 	expect(ciudadanos[1].skip).toBe(false);
			// 	expect(impostor.votos).toEqual(2);
			// 	ciudadanos[2].votar(impostor.nick);
			// 	expect(ciudadanos[2].skip).toBe(false);
			// 	expect(ciudadanos[2].haVotado).toBe(true);
			// 	expect(impostor.votos).toEqual(3);
			// 	expect(partida.numImpostoresVivos()).toEqual(1);
			// 	expect(partida.numCiudadanosVivos()).toEqual(3);
			// 	expect(partida.gananCiudadanos()).toBe(false);
			// 	expect(partida.gananImpostores()).toBe(false);
			// 	partida.eliminarMasVotado();
			// 	expect(partida.numImpostoresVivos()).toEqual(0);
			// 	expect(partida.numCiudadanosVivos()).toEqual(3);
			// 	expect(partida.gananCiudadanos()).toBe(true);
			// 	expect(partida.gananImpostores()).toBe(false);
			// 	expect(partida.fase.nombre).toEqual("final");
			// 	expect(partida.fase.ganadores).toEqual("ciudadanos");
			// 	expect(impostor.estado.nombre).toEqual("muerto");
			// });
		});

		describe("las votaciones",function(){
			beforeEach(function(){
				juego.unirAPartida(codigo, "ana");
				juego.unirAPartida(codigo, "isa");
				juego.unirAPartida(codigo, "tomas");
				juego.iniciarPartida(codigo, nick);

			});

			it("todos skipean",function(){
				var partida=juego.partidas[codigo];
				juego.lanzarVotacion(codigo, nick);
				expect(partida.fase.nombre).toEqual("votacion");
				juego.saltarVoto(codigo, nick);
				expect(partida.fase.nombre).toEqual("votacion");
				juego.saltarVoto(codigo, "ana");
				expect(partida.fase.nombre).toEqual("votacion");
				juego.saltarVoto(codigo, "isa");
				expect(partida.fase.nombre).toEqual("votacion");
				juego.saltarVoto(codigo, "tomas");
				expect(partida.fase.nombre).toEqual("jugando");
			})
			it("Se vota y mata a un inocente",function(){
				var partida=juego.partidas[codigo];
				juego.lanzarVotacion(codigo, nick);
				partida.usuarios[nick].impostor=true;
				partida.usuarios["ana"].impostor=false;
				partida.usuarios["isa"].impostor=false;
				partida.usuarios["tomas"].impostor=false;
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, nick, "tomas");
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, "ana", "tomas");
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, "isa", "tomas");
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, "tomas", "tomas");
				expect(partida.usuarios["tomas"].estado.nombre).toEqual("muerto");
				expect(partida.fase.nombre).toEqual("jugando");
			})
			it("Se vota y mata a un impostor",function(){
				var partida=juego.partidas[codigo];
				juego.lanzarVotacion(codigo, nick);
				partida.usuarios[nick].impostor=true;
				partida.usuarios["ana"].impostor=false;
				partida.usuarios["isa"].impostor=false;
				partida.usuarios["tomas"].impostor=false;
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, nick, nick);
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, "ana", nick);
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, "isa", nick);
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, "tomas", nick);
				expect(partida.usuarios[nick].estado.nombre).toEqual("muerto");
				expect(partida.fase.nombre).toEqual("final");
				expect(partida.fase.ganadores).toEqual("ciudadanos");
			})
			it("Se votan a inocentes y gana el impostor",function(){
				var partida=juego.partidas[codigo];
				juego.lanzarVotacion(codigo, nick);
				partida.usuarios[nick].impostor=true;
				partida.usuarios["ana"].impostor=false;
				partida.usuarios["isa"].impostor=false;
				partida.usuarios["tomas"].impostor=false;
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, nick, "isa");
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, "ana", "isa");
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, "isa", "isa");
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, "tomas", "isa");
				expect(partida.usuarios["isa"].estado.nombre).toEqual("muerto");
				expect(partida.fase.nombre).toEqual("jugando");
				juego.lanzarVotacion(codigo, nick);
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, nick, "tomas");
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, "ana", "tomas");
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, "isa", "tomas");
				expect(partida.fase.nombre).toEqual("votacion");
				juego.votar(codigo, "tomas", "tomas");
				expect(partida.todosHanVotado()).toBe(true);
				expect(partida.elegido).toEqual("tomas");
				expect(partida.usuarios["tomas"].estado.nombre).toEqual("muerto");
				expect(partida.fase.nombre).toEqual("final");
				expect(partida.fase.ganadores).toEqual("impostores");
			})
			it("Ataca el impostor y mata a todos",function(){
				var partida=juego.partidas[codigo];
				partida.usuarios[nick].impostor=true;
				partida.usuarios["ana"].impostor=false;
				partida.usuarios["isa"].impostor=false;
				partida.usuarios["tomas"].impostor=false;
				expect(partida.fase.nombre).toEqual("jugando");
				juego.atacar(codigo, nick, "ana");
				expect(partida.usuarios["ana"].estado.nombre).toEqual("muerto");
				expect(partida.fase.nombre).toEqual("jugando");
				juego.atacar(codigo, nick, "isa");
				expect(partida.usuarios["isa"].estado.nombre).toEqual("muerto");
				expect(partida.fase.nombre).toEqual("final");
				expect(partida.fase.ganadores).toEqual("impostores");
			})
		});

	}); 
});