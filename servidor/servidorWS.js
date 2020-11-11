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
	this.lanzarSocketSrv=function(io,juego){
		var cli=this;
		io.on('connection',function(socket){		    
			socket.on('crearPartida', function(nick,numero) {
				//var usr=new modelo.Usuario(nick);
				var codigo=juego.crearPartida(numero,nick);
				socket.join(codigo);
				console.log('usuario nick: '+nick+" crea partida codigo: "+codigo);
				cli.enviarRemitente(socket,"partidaCreada",{"codigo":codigo,"owner":nick})	        		        
			});
			socket.on('unirAPartida', function(codigo,nick) {
				//console.log('usuario nick: '+nick+" se une a partida: "+codigo);
				//nick o codigo nulo
				var res=juego.unirAPartida(codigo,nick);
				socket.join(codigo);
				var owner = juego.partidas[codigo].nickOwner;
				console.log('usuario: '+nick+" se une a partida: "+codigo);
				cli.enviarRemitente(socket,"unidoAPartida",{"codigo":res,"owner":owner});
				cli.enviarATodosMenosRemitente(socket,codigo,"nuevoJugador",nick);	        		        
			});
			socket.on('iniciarPartida', function(codigo,nick) {
				//iniciar partida toDo
				//controlar si nick es el owner de la partida desde modelo.js
				juego.iniciarPartida(codigo, nick);
				var fase = juego.partidas[codigo].fase.nombre;
				cli.enviarATodos(io,codigo,"partidaIniciada",fase);        		        
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
					partida.reiniciarContadores();
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
					partida.reiniciarContadores();
				}
				else{
					//enviar la lista de los que han votado
					cli.enviarATodos(io,codigo,"haVotado",partida.listaHanVotado());
				}
			});
			socket.on('obtenerEncargo', function(codigo, nick) {
				cli.enviarRemitente(socket,"recibirEncargo", juego.obtenerEncargo(codigo,nick));
			});
		});
	}

}

module.exports.ServidorWS=ServidorWS;