function ClienteWS(){
	this.socket=undefined;
	this.nick=undefined;
	this.codigo=undefined;
	this.impostor;
	this.numJugador=undefined;
	this.estado;
	this.encargo;
	this.ini=function(){
		this.socket=io.connect();
		this.lanzarSocketSrv();
	}
	this.crearPartida=function(nick, numero){
		this.nick=nick;
		this.socket.emit("crearPartida",nick,numero);//{"nick":nick,"numero":numero}
	}
	this.unirAPartida=function(codigo, nick){
		this.nick=nick;
		this.socket.emit("unirAPartida",codigo,nick);
	}
	this.iniciarPartida=function(){
		this.socket.emit("iniciarPartida",this.codigo,this.nick);
	}
	this.listaPartidasDisponibles=function(){
		this.socket.emit("listaPartidasDisponibles");
	}
	this.listaPartidas=function(){
		this.socket.emit("listaPartidas");
	}
	this.abandonarPartida=function(){
		this.socket.emit("abandonarPartida",this.nick,this.codigo);
	}
	this.estoyDentro=function(){
		this.socket.emit("estoyDentro",this.nick,this.codigo);
	}
	this.lanzarVotacion=function(){
		this.socket.emit("lanzarVotacion", this.codigo, this.nick);
	}
	this.saltarVoto=function(){
		this.socket.emit("saltarVoto", this.codigo, this.nick);
	}
	this.votar=function(sospechoso){
		this.socket.emit("votar", this.codigo, this.nick, sospechoso);
	}
	this.obtenerEncargo=function(){
		this.socket.emit("obtenerEncargo", this.codigo, this.nick);
	}
	this.atacar=function(atacado){
		this.socket.emit("atacar", this.codigo, this.nick, atacado);
	}
	this.listarParticipantes=function(){
		this.socket.emit("listarParticipantes", this.codigo);
	}
	this.movimiento=function(direccion,x,y){
		this.socket.emit("movimiento",this.nick,this.codigo,this.numJugador,direccion,x,y);
	}
	this.realizarTarea=function(){
		this.socket.emit("realizarTarea", this.codigo, this.nick, this.encargo);
	}
	this.limpiarMuerto=function(nickMuerto){
		this.socket.emit("limpiarMuerto", this.codigo, nickMuerto);
	}
	//servidor WS dentro del cliente
	this.lanzarSocketSrv=function(){
		var cli = this;

		this.socket.on('connect', function(){			
			console.log("conectado al servidor de Ws");
		});
		this.socket.on('partidaCreada',function(data){
			cli.codigo = data.codigo;
			console.log(data);
			if(data.codigo!="Error"){
				cw.mostrarEsperandoRival();
				cw.mostrarIniciarPartida();
				cli.numJugador=0;
				cli.estado="vivo";
			}


			//console.log("codigo partida: "+data.codigo);
			//console.log("propietario: "+data.owner);

		});
		this.socket.on('unidoAPartida',function(data){
			cli.codigo=data.codigo;
			cli.nick = data.nick;
			cli.numJugador = data.numJugador;
			cli.estado="vivo";
			console.log(data);
			cw.mostrarEsperandoRival();
		});
		this.socket.on('nuevoJugador',function(nick){
			console.log(nick+" se une a la partida");
			cw.actualizarJugadores();
			//cli.iniciarPartida();
		});
		this.socket.on('esperando',function(fase){
			console.log("esperando: "+fase);
		});
		this.socket.on('partidaIniciada',function(fase){
			console.log("Partida está en fase: "+fase);
			lanzarJuego();
			cw.limpiarLog();
			cli.obtenerEncargo();
		});
		this.socket.on('recibirListaPartidasDisponibles',function(lista){
			console.log(lista);
			if (!cli.codigo){
				cw.mostrarUnirAPartida(lista);
			}
		});
		this.socket.on('recibirListaPartidas',function(lista){
			console.log(lista);
		});
		this.socket.on('votacion',function(lista){
			console.log(lista);
			cw.mostrarModalVotacion(lista);
			
		});
		this.socket.on('finalVotacion',function(data){
			console.log(data);
			$('#modalGeneral').modal('toggle');
			//mostrar otro
			cw.mostrarModalSimple("La votacion ha acabado Elegido: "+data.elegido+" Fase: "+data.fase);
		});
		this.socket.on('haVotado',function(data){
			console.log(data);
			//actualizar la lista
		});
		this.socket.on('recibirEncargo',function(data){
			console.log(data);
			cli.impostor = data.impostor;
			cli.encargo = data.encargo;
			if (cli.impostor){
				//$('#avisarImpostor').modal("show");
				cw.mostrarModalSimple('Eres el impostor. Tu objetivo es matar a los demas');
				//crearColision();
			}
		});
		this.socket.on('muereInocente',function(inocente){
			console.log('muere '+inocente);
			if(cli.nick==inocente){
				cli.estado="muerto";
			}
			dibujarMuereInocente(inocente);
		});
		this.socket.on('final',function(data){
			console.log(data);
			finPartida(data.Ganadores);
		});
		this.socket.on('recibirListaParticipantes',function(lista){
			console.log(lista);
			cw.mostrarParticipantes(lista);
		});
		this.socket.on('dibujarRemoto',function(lista){
			console.log(lista);
			for(var i=0;i<lista.length;i++){
				if(lista[i].nick!=cli.nick){
					lanzarJugadorRemoto(lista[i].nick,lista[i].numJugador);
				}
			}
			crearColision();
		});
		this.socket.on("moverRemoto",function(datos){
			mover(datos);
		});
		this.socket.on("realizandoTarea",function(datos){
			//console.log("encargo "+res.encargo+" realizado veces: "+res.realizado+ " estadoRealizado: "+res.estadoRealizado)
			console.log(datos);
			//tareasOn=true;
		});
		this.socket.on("hasAtacado",function(fase){
			if(fase=="jugando"){
				ataquesOn=true;
			}
		});
		this.socket.on("jugadorAbandona",function(data){
			console.log(data);
		});
		this.socket.on("muertoLimpiado",function(nickMuerto){
			console.log(nickMuerto);
			borrarMuerto(nickMuerto);
		});
	}

	this.ini();

}

var ws2,ws3,ws4;
function pruebasWS(){
	ws2=new ClienteWS();
	ws3=new ClienteWS();
	ws4=new ClienteWS();
	var codigo = ws.codigo;

	ws2.unirAPartida(codigo,"juani");
	ws3.unirAPartida(codigo,"juana");
	ws4.unirAPartida(codigo,"juanan");

	//ws.iniciarPartida();
}
function saltarVotos(){
	ws.saltarVoto();
	ws2.saltarVoto();
	ws3.saltarVoto();
	ws4.saltarVoto();
}
function votar(){
	ws.votar("juani");
	ws2.votar("juani");
	ws3.votar("juani");
	ws4.votar("juani");
}
function obtenerEncargos(){
	ws.obtenerEncargo();
	ws2.obtenerEncargo();
	ws3.obtenerEncargo();
	ws4.obtenerEncargo();
}