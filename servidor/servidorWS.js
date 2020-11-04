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
				var usr=new modelo.Usuario(nick);
				var codigo=juego.crearPartida(numero,usr);
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
				var fase = juego.partidas[codigo].usuarios[nick].iniciarPartida();
				cli.enviarATodos(io,codigo,"partidaIniciada",fase);        		        
			});
		});
	}

}

module.exports.ServidorWS=ServidorWS;