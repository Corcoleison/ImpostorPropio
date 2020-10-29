function ClienteRest(){
	this.crearPartida=function(nick, num){
		$.getJSON("/crearPartida/"+nick+"/"+num,function(data){    
    		console.log(data);
		});
	}
	this.unirAPartida=function(codigo, nick){
		$.getJSON("/unirAPartida/"+codigo+"/"+nick,function(data){    
    		console.log(data);
		});
	}
	this.listarPartidas=function(){
		$.getJSON("/listarPartidas",function(lista){    
    		console.log(lista);
		});
	}
	this.iniciarPartida=function(nick, codigo){
		$.getJSON("/crearPartida/"+nick+"/"+codigo,function(data){    
    		console.log(data);
		});
	}
}