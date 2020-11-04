function ClienteWS{
	this.socket;
	
	this.ini=function(){
		this.socket=io.connect();
		this.lanzarSocketSrv();
	}
	//servidor WS dentro del cliente
	this.lanzarSocketSrv=function(){
		var cli = this;
		
		this.socket.on('connect', function(){			
			console.log("conectado al servidor de Ws");
		});
	}

}