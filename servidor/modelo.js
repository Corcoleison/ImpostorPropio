var cad=require('./cad.js');

function Juego(min, test){
	this.min=min;
	this.test = test;
	this.partidas={};//que coleccion?
	this.cad=new cad.Cad();
	
	this.unirAPartida=function(cod, nick){
		//var res = -1
		if (this.partidas[cod]){
			res = this.partidas[cod].agregarUsuario(nick);
			//var res = "Exito al agregar"
		}
		return res;
	}

	this.abandonarPartida=function(cod, nick){
		//var res = -1
		if (this.partidas[cod]){
			res = this.partidas[cod].abandonarPartida(nick);
			//var res = "Exito al agregar"
		}
	}

	this.eliminarPartida=function(cod){
			delete this.partidas[cod];
	}

	this.crearPartida=function(num,owner){
		//comprobar límites de num
		//console.log("Min: " , this.min);
		//console.log("Min[0]: " , this.min[0]);
		//console.log("Argumento Test:  ",this.test);
		if(this.numeroValido(num)){
			let codigo=this.obtenerCodigo();
			if (!this.partidas[codigo]){
				this.partidas[codigo]=new Partida(num,owner,codigo,this);
				if(this.test=="noTest"){
					var fase=this.partidas[codigo].fase.nombre;
					this.cad.insertarPartida({"codigo":codigo,"nick":owner,"numeroJugadores":num, "fase":fase},function(res){});
				}
				//owner.partida=this.partidas[codigo];
			}
			return codigo;
		}else{
			//throw "Error tamaño partida";
			let codigo = "Error";
			return codigo;
		}
	}

	this.numeroValido=function(num) {
	if(!(num<this.min || num>10)){
		return true;
	}else{
		return false;
	}
	}

	this.obtenerCodigo=function(){
		let cadena="ABCDEFGHIJKLMNOPQRSTUVXYZ";
		let letras=cadena.split('');
		let maxCadena=cadena.length;
		let codigo=[];
		for(i=0;i<6;i++){
			codigo.push(letras[randomInt(1,maxCadena)-1]);
		}
		return codigo.join('');
	}

	this.listarPartidasDisponibles=function(){
		var lista = [];
		var huecos = 0;
		var maximo = 0;
		var owner = "";
		for (var key in this.partidas){
			var partida = this.partidas[key];
			huecos=partida.obtenerHuecos();
			owner=partida.nickOwner;
			maximo = partida.maximo;
			mapa = partida.mapa;
			if(huecos>0){
				lista.push({"codigo":key,"huecos":huecos, "maximo":maximo,"owner":owner, "mapa":mapa})
			}
		}
		return lista;
	}

	this.listarPartidas=function(){
		var lista = [];
		var huecos = 0;
		for (var key in this.partidas){
			var partida = this.partidas[key];
			var owner=this.partidas[key].nickOwner;
				lista.push({"codigo":key,"owner":owner})
			}
			return lista;
		}

	this.iniciarPartida=function(codigo, nick){
		var owner=this.partidas[codigo].nickOwner;
		if(nick==owner){
			this.partidas[codigo].iniciarPartida();
		}
	}

	this.lanzarVotacion=function(codigo, nick){
		var usr=this.partidas[codigo].usuarios[nick];
		this.reiniciarContadores(codigo);
		usr.lanzarVotacion();
	}

	this.saltarVoto=function(codigo, nick){
		var usr=this.partidas[codigo].usuarios[nick];
		usr.skipear();
	}

	this.votar=function(codigo, nick, sospechoso){
		var usr=this.partidas[codigo].usuarios[nick];
		//usr=this.partida[codigo].obtenerUsuario(nick);
		usr.votar(sospechoso);
	}
	this.obtenerEncargo=function(codigo,nick){
		var res={};
		var encargo=this.partidas[codigo].usuarios[nick].encargo;
		var impostor=this.partidas[codigo].usuarios[nick].impostor;
		res={"nick":nick,"encargo":encargo,"impostor":impostor};
		return res;
	}

	this.reiniciarContadores=function(codigo){
		if(this.partidas[codigo])
		this.partidas[codigo].reiniciarContadores();
	}

	this.atacar=function(codigo, nick, atacado){
		var usr=this.partidas[codigo].usuarios[nick];
		//usr=this.partida[codigo].obtenerUsuario(nick);
		usr.atacar(atacado);
	}

	this.listarParticipantes=function(codigo){
		var lista = [];
		var partida = this.partidas[codigo];
		if (partida){
			lista = partida.devolverNicks();
		}
		return lista
	}

	this.obtenerListaJugadores=function(codigo){
		return this.partidas[codigo].obtenerListaJugadores();
	}

	this.realizarTarea=function(codigo,nick){
		this.partidas[codigo].realizarTarea(nick);
		realizado = this.partidas[codigo].usuarios[nick].realizado;
		estadoRealizado = this.partidas[codigo].usuarios[nick].estadoRealizado;
		encargo = this.partidas[codigo].usuarios[nick].realizado;
		res={"encargo":encargo, "realizado":realizado, "estadoRealizado":estadoRealizado};
		return res;
	}

	this.obtenerPercentTarea=function(codigo, nick){
		return this.partidas[codigo].usuarios[nick].obtenerPercentTarea(nick);
	}

	this.obtenerPercentGlobal=function(codigo){
		return this.partidas[codigo].obtenerPercentGlobal();
	}

	this.partidasCreadas=function(admin,callback){
		if(admin=="1234" && this.test=="noTest"){
			this.cad.obtenerPartidaCriterio({fase:"inicial"},function(lista){
				if(lista){
					callback(lista);
				}else{
					callback({})
				}
			});
		}
	}

	this.partidasFinalizadas=function(admin,callback){
		if(admin=="1234" && this.test=="noTest"){
			this.cad.obtenerPartidaCriterio({fase:"final"},function(lista){
				if(lista){
					callback(lista);
				}else{
					callback({})
				}
			});
		}
	}

	if(this.test=="noTest"){
			this.cad.connect(function(db){
			console.log("conectado a Atlas");
		})
	}

	this.calcularJugadoresPorAbandono=function(codigo){
		var partida = this.partidas[codigo];
		if (partida){
			partida.calcularJugadoresPorAbandono();
		}
	}

	this.seleccionarMapa=function(codigo, cadenaMapa){
		var partida = this.partidas[codigo];
		if (partida){
			partida.seleccionarMapa(cadenaMapa);
		}
	}

}

function Partida(num,owner,codigo, juego){
	this.juego = juego;
	this.mapa;
	this.maximo=num;
	this.nickOwner=owner;
	this.codigo=codigo;
	this.fase=new Inicial();
	this.usuarios={};
	this.elegido="no hay nadie elegido";
	this.encargos=["jardines","calles","mobiliario","basuras", "bombero"];
	this.agregarUsuario=function(nick){
		return this.fase.agregarUsuario(nick,this)
	}
	this.puedeAgregarUsuario=function(nick){
		let nuevo = nick;
		let contador = 1;
		while (this.usuarios[nuevo]){
			nuevo = nick+contador;
			contador=contador+1;
		}
		this.usuarios[nuevo]=new Usuario(nuevo);
		this.usuarios[nuevo].partida = this;
		var numero = this.numJugadores() - 1;
		this.usuarios[nuevo].numJugador = numero;
		if (this.comprobarMinimo()){
		 	this.fase=new Completado();
		 	//var fase=this.fase.nombre;
			//this.juego.cad.insertarPartida({"codigo":codigo,"nick":owner,"numeroJugadores":num, "fase":fase},function(res){})

		}
		return {"codigo":this.codigo,"nick":nuevo,"numJugador":numero, "mapa":this.mapa};


		//this.comprobarMinimo();
		
		//Mi solucion para lo de agregar
		//let usuarioAgregado = new Usuario(nick);
		//for (i=0; i<this.usuarios.length; i++){
		//	let contador = i+1;
		//	if (this.usuarios[i].nick=usuarioAgregado.nick){
		//		usuarioAgregado.nick = usuarioAgregado.nick + contador;
		//	}

	}
	this.seleccionarMapa=function(cadenaMapa){
		this.mapa = cadenaMapa;
	}

	this.obtenerUsuario=function(nick){
		return this.usuarios[nick]
	}

	this.numJugadores=function(){
		return Object.keys(this.usuarios).length
	}

	this.comprobarMinimo=function () {
		return Object.keys(this.usuarios).length >= this.juego.min;
	}

	this.comprobarMaximo=function () {
		return Object.keys(this.usuarios).length < this.maximo
	}

	this.iniciarPartida=function(){
		this.fase.iniciarPartida(this);
	}
	this.abandonarPartida=function(nick){
		this.fase.abandonarPartida(nick,this);
	}
	this.puedeAbandonarPartida=function(nick){
		this.eliminarUsuario(nick);
		if (!this.comprobarMinimo()){
			this.fase=new Inicial();
		}
		if (this.numJugadores()<=0){
			this.juego.eliminarPartida(this.codigo);
		}
	}
	this.eliminarUsuario=function(nick) {
		delete this.usuarios[nick];
	}
	this.puedeIniciarPartida=function() {
		this.asignarEncargos();
		this.asignarImpostor();
		this.fase=new Jugando();
	}
	this.asignarEncargos=function(){
		i=0;
		for(var usr in this.usuarios){
			this.usuarios[usr].encargo=this.encargos[i];
			i=i+1;
		}
	}
	this.asignarImpostor=function(){
		this.nicks=Object.keys(this.usuarios);
		//this.usuarios[this.nicks[randomInt(0,this.nicks.length)]].impostor=true;
		this.usuarios[this.nicks[randomInt(0,this.nicks.length)]].asignarImpostor();
	}
	this.atacar=function(nick){
		if(this.usuarios[nick]){
			this.fase.atacar(nick,this);
		}else{
			console.log("ese usuario no existe");
		}
		
	}
	this.puedeAtacar=function(nick){
		this.usuarios[nick].esAtacado();
	}
	this.numCiudadanosVivos=function(){
		var i = 0;
		for(var usr in this.usuarios){
			if (this.usuarios[usr].impostor == false && this.usuarios[usr].estadoVivo()){//.nombre == "vivo"){
				i++;
			}
		}
		return i
	}
	this.numCiudadanos=function(){
		var i = 0;
		for(var usr in this.usuarios){
			if (this.usuarios[usr].impostor == false){
				i++;
			}
		}
		return i
	}
	this.numImpostoresVivos=function(){
		var i=0;
		for(var usr in this.usuarios){
			if (this.usuarios[usr].impostor == true && this.usuarios[usr].estadoVivo()){//nombre == "vivo"){
				i++;
			}
		}
		return i
	}
	this.identificarImpostor=function(){
		var i=0;
		var impostor;
		for(var usr in this.usuarios){
			if (this.usuarios[usr].impostor == true && this.usuarios[usr].estadoVivo()){//nombre == "vivo"){
				impostor = this.usuarios[usr];
			}
		}
		return impostor
	}
	this.devolverCiudadanosVivos=function(){
		var i=0;
		var ciudadanos = [];
		for(var usr in this.usuarios){
			if (this.usuarios[usr].impostor == false && this.usuarios[usr].estadoVivo()){//.nombre == "vivo"){
				ciudadanos[i] = this.usuarios[usr];
				i++;
			}
		}
		return ciudadanos
	}
	this.votar=function(nick) {
		this.fase.votar(nick,this);
	}
	this.puedeVotar=function(nick) {
		this.usuarios[nick].esVotado();
		this.comprobarVotacion();
	}
	this.jugadorMasVotado=function(){
		var votos = 0;
		var masVotado="No hay nadie mas votado";
		for(var usr in this.usuarios){
			if (this.usuarios[usr].votos > votos && this.usuarios[usr].estadoVivo()){//.nombre == "vivo"){
				votos = this.usuarios[usr].votos;
				masVotado = this.usuarios[usr];
			}
		}
		//comprobar que solo hay 1 mas votado
		return masVotado
	}
	this.eliminarMasVotado=function(){
		this.fase.eliminarMasVotado(this);
	}
	this.puedeEliminarMasVotado=function(){
		this.comprobarVotacion();
	}
	this.comenzarVotacion=function(){
		this.fase.comenzarVotacion(this);
	}
	this.puedeComenzarVotacion=function(){
		this.fase = new Votacion();
	}
	this.gananImpostores=function(){
		return this.numImpostoresVivos() >= this.numCiudadanosVivos()
	}
	this.gananCiudadanos=function(){
		//comprobar que el numero de impostores vivos es 0	
		return this.numImpostoresVivos() == 0
	}
	this.numeroSkips=function(){
		var i = 0;
		for(var usr in this.usuarios){
			if (this.usuarios[usr].skip == true && this.usuarios[usr].estadoVivo()){//.nombre == "vivo"){
				i++;
			}
		}
		return i
	}
	this.reiniciarContadores=function(){
		this.elegido="No hay nadie elegido"
		for(var usr in this.usuarios){
			if (this.usuarios[usr].estadoVivo()){//.nombre == "vivo"){
				this.usuarios[usr].skip = false;
				this.usuarios[usr].votos = 0;
				this.usuarios[usr].haVotado = false;
			}
		}
	}
	this.comprobarFinal=function(){
		if (this.gananImpostores()){
			this.finPartidaImpostores();
		}
		else if (this.gananCiudadanos()){
			this.finPartidaCiudadanos();
		}
		else{
			this.fase=new Jugando();
		}
	}
	this.finalVotacion=function(){
		this.fase=new Jugando();
		//this.reiniciarContadores();
		this.comprobarFinal();
	}
	this.finPartidaImpostores=function(){
		this.fase = new Final();
		this.fase.ganadores = "impostores";
		if(this.juego.test=="noTest"){
			var fase=this.fase.nombre;
			this.juego.cad.insertarPartida({"codigo":codigo,"nick":owner,"numeroJugadores":num, "fase":fase},function(res){})
		}
		
	}
	this.finPartidaCiudadanos=function(){
		this.fase = new Final();
		this.fase.ganadores = "ciudadanos";
		if(this.juego.test=="noTest"){
			var fase=this.fase.nombre;
			this.juego.cad.insertarPartida({"codigo":codigo,"nick":owner,"numeroJugadores":num, "fase":fase},function(res){})
		}
	}
	this.comprobarVotacion=function(){
		if (this.todosHanVotado()){
			let elegido=this.jugadorMasVotado();
			if (elegido && elegido.votos>this.numeroSkips()){
				this.elegido=elegido.nick;
				elegido.esAtacado();
				//this.puedeAtacar(elegido.nick);
			}
			this.finalVotacion();
		}
		
	}
	this.obtenerHuecos=function(){
		return this.maximo - Object.keys(this.usuarios).length
	}
	this.devolverPartidasLibres=function(){
		this.fase.devolverPartidasLibres(this);
	}
	this.puedeDevolverPartidasLibres=function(){
		if(this.obtenerHuecos() > 0){
			return this
		}
	}
	this.todosHanVotado=function(){
		let res=true;
		for(var key in this.usuarios){
			if(this.usuarios[key].estadoVivo() && !this.usuarios[key].haVotado){
				res=false;
				break;
			}
		}
		return res
	}
	this.listaHanVotado=function(){
		var lista=[];
		for(var key in this.usuarios){
			if(this.usuarios[key].estadoVivo() && this.usuarios[key].haVotado){
				lista.push(key);
			}
		}
		return lista;
	}
	this.devolverNicks=function(){
		var lista=[];
		for(var key in this.usuarios){
			lista.push({"nick":key});
		}
		return lista;
	}
	this.obtenerListaJugadoresVivos=function(){
		var lista=[]
		for(var key in this.usuarios){
			if(this.usuarios[key].estadoVivo()){
				var numero = this.usuarios[key].numJugador;
				lista.push({nick:key, numJugador:numero});
			}
		}
		return lista;
	}
	this.obtenerListaJugadores=function(){
		var lista=[]
		for(var key in this.usuarios){
			var numero = this.usuarios[key].numJugador;
			lista.push({nick:key, numJugador:numero});
		}
		return lista;
	}
	this.realizarTarea=function(nick){
		this.fase.realizarTarea(nick, this);
	}
	this.puedeRealizarTarea=function(nick){
		this.usuarios[nick].realizarTarea();
	}
	this.tareaTerminada=function(){
		if(this.comprobarTareasTerminadas()){
			this.finPartidaCiudadanos();
			console.log("Termina el juego porque se han realizado todas las tareas");
		}
	}
	this.comprobarTareasTerminadas=function(){
		let res=true;
		for(var key in this.usuarios){
			if(this.usuarios[key].estadoRealizado == false){
				res=false;
				break;
			}
		}
		return res
	}

	this.obtenerPercentTarea=function(nick){
		return this.usuarios[nick].obtenerPercentTarea();
	}

	this.obtenerPercentGlobal=function(){
		var total = 0;
		for (var key in this.usuarios){
			total = total+this.obtenerPercentTarea(key);
		}
		total = total/this.numJugadores();
		return total;
	}

	this.calcularJugadoresPorAbandono=function(){
		ganadores = undefined;
		if(this.numJugadores() < this.juego.min){
			for(var key in this.usuarios){
				if(this.usuarios[key].impostor == true){
					ganadores = "impostor"
				}
			}
			if (ganadores == "impostor"){
				this.finPartidaImpostores();
			}else{
				this.finPartidaCiudadanos();
			}
		}
	}





	this.agregarUsuario(owner);
}

function Inicial(){
	this.nombre="inicial";

	this.agregarUsuario=function(nick,partida){
		return partida.puedeAgregarUsuario(nick);	
	}
	this.iniciarPartida=function(partida){
		console.log("Faltan jugadores");
	}
	this.abandonarPartida=function(nick,partida){
		partida.puedeAbandonarPartida(nick);
		//comprobar si no quedan usuarios
		
	}
	this.atacar=function(nick,partida){
		//no puede atacar con la partida sin empezar
	}
	this.votar=function(nick, partida) {
		//no
	}
	this.comenzarVotacion=function(partida){
		//
	}
	this.eliminarMasVotado=function(partida){
		//
	}
	this.skipear=function(usr){
		//
	}
	this.devolverPartidasLibres=function(partida){
		partida.puedeDevolverPartidasLibres();
	}
	this.realizarTarea=function(nick){
		//
	}

}

function Completado(){
	this.nombre="completado";
	this.iniciarPartida=function(partida){
		//llame a puedeIniciarPartida();
		partida.puedeIniciarPartida();
		//partida.fase=new Jugando();
		//asignar encargos: secuencialmente a todos los usuarios
		//asignar impostor: dado el array (Object.keys) coges uno aleatorio y le asignas true
	}
	this.agregarUsuario=function(nick,partida){
		if(partida.comprobarMaximo()){
			return partida.puedeAgregarUsuario(nick);
		}else{
			console.log("Lo siento partida llena");
		}
		
	}
	this.abandonarPartida=function(nick,partida){
		partida.puedeAbandonarPartida(nick);
		
	}
	this.atacar=function(nick,partida){
		//no puede atacar con la partida sin empezar
	}
	this.votar=function(nick, partida) {
		//no
	}
	this.comenzarVotacion=function(partida){
		//
	}
	this.eliminarMasVotado=function(partida){
		//
	}
	this.skipear=function(usr){
		//
	}
	this.devolverPartidasLibres=function(partida){
		partida.puedeDevolverPartidasLibres();
	}
	this.realizarTarea=function(nick){
		//
	}
}

function Jugando(){
	this.nombre="jugando";
	this.agregarUsuario=function(nick,partida){
		console.log("La partida ya ha comenzado");
	}
	this.iniciarPartida=function(partida){
	}
	this.abandonarPartida=function(nick,partida){
		partida.puedeAbandonarPartida(nick);
	}
	this.atacar=function(nick,partida){
		partida.puedeAtacar(nick);
	}
	this.votar=function(nick, partida) {
		//
	}
	this.comenzarVotacion=function(partida){
		partida.puedeComenzarVotacion();
	}
	this.eliminarMasVotado=function(partida){
		//
	}
	this.skipear=function(usr){
		//
	}
	this.devolverPartidasLibres=function(partida){
		//
	}
	this.realizarTarea=function(nick, partida){
		partida.puedeRealizarTarea(nick);
	}
}

function Final(){
	this.nombre="final";
	this.ganadores="ninguno";
	this.agregarUsuario=function(nick,partida){
		console.log("La partida ha terminado");
	}
	this.iniciarPartida=function(partida){
	}
	this.abandonarPartida=function(nick,partida){
		partida.puedeAbandonarPartida(nick);
	}
	this.atacar=function(nick,partida){
		//no puede atacar con la partida terminada
	}
	this.votar=function(nick, partida) {
		//no
	}
	this.comenzarVotacion=function(partida){
		//
	}
	this.eliminarMasVotado=function(partida){
		//
	}
	this.skipear=function(usr){
		//
	}
	this.devolverPartidasLibres=function(partida){
		//
	}
	this.realizarTarea=function(nick){
		//
	}
}
function Votacion(){
	this.nombre="votacion";
	this.agregarUsuario=function(nick,partida){
		//
	}
	this.iniciarPartida=function(partida){
	}
	this.abandonarPartida=function(nick,partida){
		partida.puedeAbandonarPartida(nick);
	}
	this.atacar=function(nick,partida){
		//
	}
	this.votar=function(nick, partida) {
		partida.puedeVotar(nick);
	}
	this.comenzarVotacion=function(partida){
		//
	}
	this.eliminarMasVotado=function(partida){
		partida.puedeEliminarMasVotado();
	}
	this.skipear=function(usr){
		usr.estado.skipear(usr);
	}
	this.devolverPartidasLibres=function(partida){
		//
	}
	this.realizarTarea=function(nick){
		//
	}
}

function Usuario(nick,juego){
	this.nick=nick;
	this.juego=juego;
	this.skip = false;
	this.votos = 0;
	this.partida;
	this.numJugador;
	this.haVotado=false;
	this.estado = new Vivo();
	this.impostor=false;
	this.encargo="ninguno";
	this.realizado=0;
	this.estadoRealizado=false;
	this.maxTarea=10;
	this.crearPartida=function(num){
		return this.juego.crearPartida(num,this);
	}
	this.estadoVivo=function(){
		return this.estado.estadoVivo();
	}
	this.iniciarPartida=function(){
		this.partida.iniciarPartida();
	}
	this.abandonarPartida=function(){
		this.partida.abandonarPartida(this.nick);
		if (this.partida.numJugadores <= 0){
			console.log(this.nick," era el ultimo jugador de la partida");
			// this.juego.eliminarPartida(this.partida.codigo);
		}
	}
	// this.unirAPartida=function(cod){
	// 	this.partida = this.juego.unirYDevolverPartida(cod, this);
	// }
	this.atacar=function(nick){
		if(this.impostor && nick != this.nick){ //He puesto esta ultima condicion porque sino se podria matar a si mismo
			this.estado.atacar(nick, this.partida);
		}
	}
	this.esAtacado=function(){
		this.estado.esAtacado(this, this.partida);
	}
	this.votar=function(nick){
			this.estado.votar(nick, this.partida, this);
	}
	this.esVotado=function(){
		this.estado.esVotado(this);
	}
	this.lanzarVotacion=function(){
		this.estado.lanzarVotacion(this);
	}
	this.puedeLanzarVotacion=function(){
		this.partida.comenzarVotacion();
	}
	this.skipear=function(){
		this.partida.fase.skipear(this);
	}
	this.puedeSkipear=function(){
		this.skip = true;
		this.haVotado=true;
		this.partida.comprobarVotacion();
	}
	this.realizarTarea=function(){
		if(!this.impostor && this.realizado < this.maxTarea){
			this.realizado = this.realizado + 1;
			if (this.realizado >= this.maxTarea){
				this.estadoRealizado = true;
				this.partida.tareaTerminada();
			}
			console.log("usuario: "+this.nick+" realiza "+this.encargo+" realizada numero: "+this.realizado+" estadoRealizado: "+this.estadoRealizado+"");
		}

	}
	this.asignarImpostor=function(){
		this.impostor = true;
		this.estadoRealizado = true;
		this.realizado = this.maxTarea;
	}
	this.obtenerPercentTarea=function(){
		return ((this.realizado*100)/this.maxTarea)
		
	}
}

function Vivo(){
	this.nombre="vivo";
	this.atacar=function(nick,partida){
		partida.atacar(nick);
	}
	this.esAtacado=function(atacado, partida){
		atacado.estado = new Muerto();
		partida.comprobarFinal();
	}
	this.votar=function(nick, partida, votante){
		votante.haVotado = true;
		partida.votar(nick);
	}
	this.esVotado=function(votado){
		votado.votos ++;
	}
	this.lanzarVotacion=function(usuario){
		usuario.puedeLanzarVotacion(this);
	}
	this.skipear=function(usr){
		usr.puedeSkipear();
	}
	this.estadoVivo=function(){
		return true;
	}
}

function Muerto(){
	this.nombre="muerto";
	this.atacar=function(nick,partida){
		//un muerto no puede atacar
	}
	this.esAtacado=function(atacado, partida){
		//no puedes atacar a un muerto
	}
	this.votar=function(nick, partida, votante){
		//los muertos no votan
	}
	this.esVotado=function(votado){
		//no se le puede votar a los muertos
	}
	this.lanzarVotacion=function(usuario){
		//muerto no puede hacer nada
	}
	this.skipear=function(usr){
		//
	}
	this.estadoVivo=function(){
		return false;
	}
	
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

function numeroValido(num,min) {
	if(!(num<min || num>10)){
		return true;
	}else{
		return false;
	}
}

// function inicio(){
// 	juego=new Juego();
// 	var usr=new Usuario("pepe",juego);
// 	var codigo=usr.crearPartida(4);
// 	if (codigo != "Error"){
// 		juego.unirAPartida(codigo,"luis");
// 		juego.unirAPartida(codigo,"luisa");
// 		juego.unirAPartida(codigo,"luisito");
// 		usr.iniciarPartida();
// 	}
// }

module.exports.Juego=Juego;
module.exports.Usuario=Usuario;
module.exports.Inicial=Inicial;