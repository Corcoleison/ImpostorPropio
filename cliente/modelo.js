function Juego(){
	this.partidas={};//que coleccion?
	
	this.unirAPartida=function(cod, nick){
		if (this.partidas[cod]){
			this.partidas[cod].agregarUsuario(nick);
		}
		return this.partidas[cod];

	}

	this.crearPartida=function(num,owner){
		//comprobar límites de num
		if(!(num<4 || num>10)){
			let codigo=this.obtenerCodigo();
				if (!this.partidas[codigo]){
					this.partidas[codigo]=new Partida(num,owner.nick);
					owner.partida=this.partidas[codigo];
				}
			return codigo;
		}else{
			console.log("la partida debe ser de entre 4 y 10 jugadores");
			throw "tamaño partida";
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

function Partida(num,owner){
	this.maximo=num;
	this.nickOwner=owner;
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
	this.eliminarUsuario=function(nick) {
		delete this.usuarios[nick];
	}
	this.puedeIniciarPartida=function() {
		this.nicks=Object.keys(this.usuarios);
		for(var usr in this.usuarios){
			i=0;
			this.usuarios[usr].encargo=this.encargos[i];
			i+1;
		}
		this.usuarios[this.nicks[randomInt(0,this.nicks.length)]].impostor=true;
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
		partida.eliminarUsuario(nick);
		//comprobar si no quedan usuarios
	}
}

function Completado(){
	this.nombre="completado";
	this.iniciarPartida=function(partida){
		//llame a puedeIniciarPartida();
		partida.puedeIniciarPartida();
		//partida.fase=new Jugando();
		partida.fase=new Jugando();
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
		partida.eliminarUsuario(nick);
		if (!partida.comprobarMinimo()){
			partida.fase=new Inicial();
		}
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
		partida.eliminarUsuario(nick);
		//comprobar si termina la partida
	}
}

function Final(){
	this.nombre="final";
	this.agregarUsuario=function(nick,partida){
		console.log("La partida ha terminado");
	}
	this.iniciarPartida=function(partida){
	}
	this.abandonarPartida=function(nick,partida){
		//esto es absurdo
	}
}

function Usuario(nick,juego){
	this.nick=nick;
	this.juego=juego;
	this.partida;
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
	}
	this.unirAPartida=function(cod){
		this.partida = this.juego.unirAPartida(cod, this.nick);
	}
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

function inicio(){
	juego=new Juego();
	var usr=new Usuario("pepe",juego);
	try{
		var codigo=usr.crearPartida(4);
		juego.unirAPartida(codigo,"luis");
		juego.unirAPartida(codigo,"luisa");
		juego.unirAPartida(codigo,"luisito");

		usr.iniciarPartida();
	}catch(err){
		console.log(err);
	}
	


}