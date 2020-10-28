function Juego(){
	this.partidas={};//que coleccion?
	
	this.unirAPartida=function(cod, nick){
		if (this.partidas[cod]){
			this.partidas[cod].agregarUsuario(nick);
		}
		return this.partidas[cod];

	}

	this.eliminarPartida=function(cod){
		if (this.partidas[cod]){
			delete this.partidas[cod];
		}
	}

	this.crearPartida=function(num,owner){
		//comprobar límites de num
		if(numeroValido(num)){
			let codigo=this.obtenerCodigo();
			if (!this.partidas[codigo]){
				this.partidas[codigo]=new Partida(num,owner.nick,codigo);
				owner.partida=this.partidas[codigo];
			}
			return codigo;
		}else{
			//throw "Error tamaño partida";
			let codigo = "Error";
			return codigo;
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

}

function Partida(num,owner,codigo){
	this.maximo=num;
	this.nickOwner=owner;
	this.codigo=codigo;
	this.fase=new Inicial();
	this.usuarios={};
	this.encargos=["jardines","calles","mobiliario","basuras"];
	this.agregarUsuario=function(nick){
		this.fase.agregarUsuario(nick,this)
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
		//this.comprobarMinimo();
		
		//Mi solucion para lo de agregar
		//let usuarioAgregado = new Usuario(nick);
		//for (i=0; i<this.usuarios.length; i++){
		//	let contador = i+1;
		//	if (this.usuarios[i].nick=usuarioAgregado.nick){
		//		usuarioAgregado.nick = usuarioAgregado.nick + contador;
		//	}

	}

	this.numJugadores=function(){
		return Object.keys(this.usuarios).length
	}

	this.comprobarMinimo=function () {
		return Object.keys(this.usuarios).length >= 4
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
		for(var usr in this.usuarios){
			i=0;
			this.usuarios[usr].encargo=this.encargos[i];
			i+1;
		}
	}
	this.asignarImpostor=function(){
		this.nicks=Object.keys(this.usuarios);
		this.usuarios[this.nicks[randomInt(0,this.nicks.length)]].impostor=true;
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
			if (this.usuarios[usr].impostor == false && this.usuarios[usr].estado.nombre == "vivo"){
				i++;
			}
		}
		return i
	}
	this.numImpostoresVivos=function(){
		var i=0;
		for(var usr in this.usuarios){
			if (this.usuarios[usr].impostor == true && this.usuarios[usr].estado.nombre == "vivo"){
				i++;
			}
		}
		return i
	}
	this.identificarImpostor=function(){
		var i=0;
		var impostor;
		for(var usr in this.usuarios){
			if (this.usuarios[usr].impostor == true && this.usuarios[usr].estado.nombre == "vivo"){
				impostor = this.usuarios[usr];
			}
		}
		return impostor
	}
	this.devolverCiudadanosVivos=function(){
		var i=0;
		var ciudadanos = [];
		for(var usr in this.usuarios){
			if (this.usuarios[usr].impostor == false && this.usuarios[usr].estado.nombre == "vivo"){
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
	}
	this.jugadorMasVotado=function(){
		var votos = 0;
		var masVotado;
		for(var usr in this.usuarios){
			if (this.usuarios[usr].votos > votos && this.usuarios[usr].estado.nombre == "vivo"){
				votos = this.usuarios[usr].votos;
				masVotado = this.usuarios[usr];
			}
		}
		return masVotado
	}
	this.eliminarMasVotado=function(){
		this.fase.eliminarMasVotado(this);
	}
	this.puedeEliminarMasVotado=function(){
		this.comprobarVotacion();
		this.terminarVotacion();
	}
	this.comenzarVotacion=function(){
		this.fase.comenzarVotacion(this);
	}
	this.puedeComenzarVotacion=function(){
		this.fase = new Votacion();
	}
	this.terminarVotacion=function(){
		this.comprobarFinal();
		this.reiniciarContadores();
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
			if (this.usuarios[usr].skip == true && this.usuarios[usr].estado.nombre == "vivo"){
				i++;
			}
		}
		return i
	}
	this.reiniciarContadores=function(){
		for(var usr in this.usuarios){
			if (this.usuarios[usr].estado.nombre == "vivo"){
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
			this.fase = new Jugando();
		}
	}
	this.finPartidaImpostores=function(){
		this.fase = new Final();
		this.fase.ganadores = "impostores";
	}
	this.finPartidaCiudadanos=function(){
		this.fase = new Final();
		this.fase.ganadores = "ciudadanos";
	}
	this.comprobarVotacion=function(){
		let elegido=this.jugadorMasVotado();
		if (elegido && elegido.votos>this.numeroSkips()){
			elegido.esAtacado();
		}
	}


	this.agregarUsuario(owner);
}

function Inicial(){
	this.nombre="inicial";

	this.agregarUsuario=function(nick,partida){
		partida.puedeAgregarUsuario(nick);
		if (partida.comprobarMinimo()){
			partida.fase=new Completado();
		}		
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
			partida.puedeAgregarUsuario(nick);
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
		//esto es absurdo
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
		//no puede atacar con la partida terminada
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
}

function Usuario(nick,juego){
	this.nick=nick;
	this.juego=juego;
	this.skip = false;
	this.votos = 0;
	this.partida;
	this.haVotado=false;
	this.estado = new Vivo();
	this.impostor=false;
	this.encargo="ninguno";
	this.crearPartida=function(num){
		return this.juego.crearPartida(num,this);
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
	this.unirAPartida=function(cod){
		this.partida = this.juego.unirAPartida(cod, this.nick);
	}
	this.atacar=function(nick){
		if(this.impostor && nick != this.nick){ //He puesto esta ultima condicion porque sino se podria matar a si mismo
			this.estado.atacar(nick, this.partida);
		}
	}
	this.esAtacado=function(){
		this.estado.esAtacado(this, this.partida);
	}
	this.votar=function(nick){
		if(nick != this.nick) this.estado.votar(nick, this.partida, this);
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
	
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

function numeroValido(num) {
	if(!(num<4 || num>10)){
		return true;
	}else{
		return false;
	}
}

function inicio(){
	juego=new Juego();
	var usr=new Usuario("pepe",juego);
	var codigo=usr.crearPartida(4);
	if (codigo != "Error"){
		juego.unirAPartida(codigo,"luis");
		juego.unirAPartida(codigo,"luisa");
		juego.unirAPartida(codigo,"luisito");
		usr.iniciarPartida();
	}
}

module.exports.Juego=Juego;
module.exports.Usuario=Usuario;
module.exports.Inicial=Inicial;