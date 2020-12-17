var modelo=require("./modelo.js");

function ServidorWS(){
	this.enviarRemitente=function(socket,mens,datos){
        socket.emit(mens,datos);
    }
    this.enviarATodos=function(io,nombre,mens,datos){
        io.sockets.in(nombre).emit(mens,datos);
    }
    this.enviarATodosMenosRemitente=function(socket,nombre,mens,datos){
        socket.broadcast.to(nombre).emit(mens,datos)
    };
    this.enviarGlobal=function(socket,mensaje,datos){
        socket.broadcast.emit(mensaje,datos);
    };
	this.lanzarSocketSrv=function(io,juego){
		var cli=this;
		io.on('connection',function(socket){		    
			socket.on('crearPartida', function(nick,numero) {
				//var usr=new modelo.Usuario(nick);
				var codigo=juego.crearPartida(numero,nick);
				socket.join(codigo);
				console.log('usuario nick: '+nick+" crea partida codigo: "+codigo);
				cli.enviarRemitente(socket,"partidaCreada",{"codigo":codigo,"owner":nick});
				var lista = juego.listarPartidasDisponibles();
				cli.enviarGlobal(socket,"recibirListaPartidasDisponibles",lista);
			});
			socket.on('unirAPartida', function(codigo,nick) {
				//console.log('usuario nick: '+nick+" se une a partida: "+codigo);
				//nick o codigo nulo
				var res=juego.unirAPartida(codigo,nick);
				socket.join(codigo);
				var owner = juego.partidas[codigo].nickOwner;
				console.log('usuario: '+res.nick+" se une a partida: "+res.codigo);
				cli.enviarRemitente(socket,"unidoAPartida",res);
				cli.enviarATodosMenosRemitente(socket,codigo,"nuevoJugador",nick);
				var lista = juego.listarPartidasDisponibles();
				cli.enviarGlobal(socket,"recibirListaPartidasDisponibles",lista);	        		        
			});
			socket.on('iniciarPartida', function(codigo,nick) {
				//iniciar partida toDo
				//controlar si nick es el owner de la partida desde modelo.js
				juego.iniciarPartida(codigo, nick);
				var fase = juego.partidas[codigo].fase.nombre;
				if (fase =="jugando"){
					cli.enviarATodos(io,codigo,"partidaIniciada",fase);
				}
				else{
					cli.enviarRemitente(socket,"esperando", fase);
				}
			});
			socket.on('listaPartidasDisponibles', function() {
				var lista = juego.listarPartidasDisponibles();
				cli.enviarRemitente(socket,"recibirListaPartidasDisponibles", lista);     		        
			});
			socket.on('listaPartidas', function() {
				var lista = juego.listarPartidas();
				cli.enviarRemitente(socket,"recibirListaPartidas", lista);     		        
			});
			socket.on('lanzarVotacion', function(codigo, nick) {
				juego.lanzarVotacion(codigo,nick);
				var fase=juego.partidas[codigo].fase.nombre;
				cli.enviarATodos(io,codigo,"votacion",fase);
			});
			socket.on('saltarVoto', function(codigo, nick) {
				var partida=juego.partidas[codigo];
				juego.saltarVoto(codigo,nick);
				if(partida.todosHanVotado()){
					var data={"elegido":partida.elegido,"fase":partida.fase.nombre};
					cli.enviarATodos(io,codigo,"finalVotacion",data);
					//partida.reiniciarContadores();
				}
				else{
					//enviar la lista de los que han votado
					cli.enviarATodos(io,codigo,"haVotado",partida.listaHanVotado());
				}
			});
			socket.on('votar', function(codigo, nick, sospechoso) {
				var partida=juego.partidas[codigo];
				juego.votar(codigo,nick,sospechoso);
				if(partida.todosHanVotado()){
					var data={"elegido":partida.elegido,"fase":partida.fase.nombre};
					cli.enviarATodos(io,codigo,"finalVotacion",data);
					//partida.reiniciarContadores();
				}
				else{
					//enviar la lista de los que han votado
					cli.enviarATodos(io,codigo,"haVotado",partida.listaHanVotado());
				}
			});
			socket.on('obtenerEncargo', function(codigo, nick) {
				cli.enviarRemitente(socket,"recibirEncargo", juego.obtenerEncargo(codigo,nick));
			});
			socket.on('atacar', function(codigo, nick, atacado) {
				juego.atacar(codigo, nick, atacado);
				var partida=juego.partidas[codigo];
				//var usr_atacado=juego.partidas[codigo].obtenerUsuario(atacado)
				//var data={"Atacado":atacado,"estado":usr_atacado.estado.nombre};
				//var data={"Atacado":atacado,"estado":usr_atacado.estado.nombre};
				cli.enviarATodos(io,codigo,"muereInocente", atacado);
				cli.enviarRemitente(socket,"hasAtacado",partida.fase.nombre);
				if (partida.fase.nombre == "final"){
					var data={"Fase":partida.fase.nombre,"Ganadores":partida.fase.ganadores};
					cli.enviarATodos(io,codigo,"final",data);
				}
				//avisar al inocente
				//cli.enviarRemitente(socket,"muereInocente", partida.fase.nombre);
			});
			socket.on('listarParticipantes', function(codigo) {
				var lista = juego.listarParticipantes(codigo);
				cli.enviarRemitente(socket,"recibirListaParticipantes", lista);     		        
			});
			socket.on('estoyDentro', function(nick,codigo) {
				//var usr=juego.obtenerJugador(nick,codigo);
				// var numero=juego.partidas[codigo].usuarios[nick].numJugador;
				// var datos = {nick:nick,numJugador:numero};
				// cli.enviarATodosMenosRemitente(socket,codigo,"dibujarRemoto",datos); 
				var lista = juego.obtenerListaJugadores(codigo);
				cli.enviarRemitente(socket,"dibujarRemoto", lista);       
			});
			socket.on('movimiento', function(nick, codigo, numJugador, direccion, x,y) {
				var datos ={direccion:direccion,nick:nick,numJugador:numJugador,x:x,y:y};
				cli.enviarATodosMenosRemitente(socket,codigo,"moverRemoto",datos);
			});
			socket.on('realizarTarea', function(codigo, nick, encargo) {
				res = juego.realizarTarea(codigo,nick);
				var partida=juego.partidas[codigo];
				if (partida.fase.nombre == "final"){
					var data={"Fase":partida.fase.nombre,"Ganadores":partida.fase.ganadores};
					cli.enviarATodos(io,codigo,"final",data);
				}
				//obtener porcentaje para dibujar algo (global o local)
				percentGlobal = juego.obtenerPercentGlobal(codigo);
				percentLocal = juego.obtenerPercentTarea(codigo, nick);
				var datos = {percentGlobal:percentGlobal, percentLocal:percentLocal}
				cli.enviarRemitente(socket,"realizandoTarea", datos);
			});
		});
	}

}

module.exports.ServidorWS=ServidorWS;