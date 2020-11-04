function ServidorWS{

	this.enviarRemitente=function(socket,mens,datos){
        socket.emit(mens,datos);
    }
	
	this.lanzarSocketSrv=function(io,juego){
		var cli=this;
		io.on('connection',function(socket){		    
			socket.on('crearPartida', function(nick,numero) {
				console.log('usuario nick: '+nick+" crea partida numero: "+numero);
				var usr=new modelo.Usuario(nick);
				var codigo=juego.crearPartida(num,usr);		        				
				cli.enviarRemitente(socket,"partidaCreada",codigo)		        		        
			});
		});
	}

}

module.exports.ServidorWS=ServidorWS;