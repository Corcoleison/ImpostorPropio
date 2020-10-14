describe("El juego del impostor", function() {
  var juego;
  var usr;

  beforeEach(function() {
    juego=new Juego();
    usr = new Usuario("pepe",juego);
  });

  it("Comprobar valores iniciales", function() {
    expect(Object.keys(juego.partidas).length).toEqual(0);
    expect(usr.nick).toEqual("pepe");
    expect(usr.juego).not.toBe(undefined);
  });

  describe("cuando el usuario pepe crea una partida", function() {
    beforeEach(function() {
       	codigo=usr.crearPartida(4);
		fase = new Inicial();
		partida = juego.partidas[codigo];
    });

		it("el usr Pepe crea una partida de 4 jugadores", function() {
		    expect(codigo).not.toBe(undefined);
		    expect(partida.nickOwner==usr.nick).toBe(true);
		    expect(partida.fase.nombre=="inicial").toBe(true);
		    expect(partida.maximo==4).toBe(true);
		    expect(Object.keys(partida.usuarios).length==1).toBe(true);
		  });

	   it("4 usuario se unen a la partida mediante unirAPartida", function() {
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
	    	usr.iniciarPartida(codigo);
	    	expect(partida.fase.nombre=="jugando").toBe(true);
	  	});
  });

  

})