function ControlWeb($){

	this.mostrarCrearPartida=function(min){
		var cadena='<div id="mostrarCP">';
		cadena=cadena+'<div class="form-group">';
		cadena=cadena+'<h3>Crear Partida</h3>';
		cadena=cadena+'<label for="nick">Nick:</label>';
		cadena=cadena+'<input value="player"  type="text" class="form-control" id="nick">';
		cadena=cadena+'</div>';
		cadena=cadena+'<div class="form-group">';
		cadena=cadena+'<label for="num">Numero:</label>';
		cadena=cadena+'<input value="'+min+'" type="number" class="form-control" id="num"  min="'+min+'" max="10">';
		cadena=cadena+'</div>';
		cadena=cadena+'<label>Mapa:</label>';
		cadena=cadena+'<div id="rates" class="input-group">';
  		cadena=cadena+'<div><input type="radio" id="r1" name="rate" value="piratas" checked="checked"> Piratas</div>';
  		cadena=cadena+'<div><input type="radio" id="r2" name="rate" value="rural"> Rural</div>';
		cadena=cadena+'</div>';
		cadena=cadena+'<button type="button" id="btnCrear" class="btn btn-primary">Crear Partida</button>';
		cadena=cadena+'</div>';

		$('#crearPartida').append(cadena);

		cadenaMapa=$('input[name=rate]:checked', '.input-group').val();
		$('.input-group input').on('change', function() {
		   cadenaMapa=$('input[name=rate]:checked', '.input-group').val();
		});

		$('#btnCrear').on('click',function(){
			var nick=$('#nick').val();
			var num=$("#num").val();
			$("#mostrarCP").hide();
			if(nick != ""){
				ws.crearPartida(nick,num,cadenaMapa);
				console.log(cadenaMapa);
			}else{
				$("#mostrarCP").show();
			}
			//mostrarEsperandoRival
		});
	}
	this.limpiar=function(){
		$('#encabezado').remove();
		$('#mUAP').remove();
		$("#mostrarCP").remove();
	}

	this.mostrarEsperandoRival=function(){
		$('#mER').remove();
		var cadena="<div id='mER'>";
		cadena=cadena+"<img src='cliente/img/waitingS.gif' class='img-responsive center-block'>";
		cadena=cadena+"</div>";
		this.limpiar();
		$('#esperando').append(cadena);
		ws.listarParticipantes();
	}

	this.mostrarUnirAPartida=function(lista){
		$('#mUAP').remove();
		var cadena='<div id="mUAP">';
		cadena=cadena+'<h3>Unirse a una Partida</h3>';
		cadena=cadena+'<div class="list-group">';
		for(var i=0;i<lista.length;i++){
			var maximo=lista[i].maximo
			var numJugadores=maximo-(lista[i].huecos)
	  		cadena=cadena+'<a href="#" value="'+lista[i].codigo+'" class="list-group-item">'+lista[i].codigo+' Host: '+lista[i].owner+' Mapa: '+lista[i].mapa+' <span class="badge">'+numJugadores+'/'+maximo+'</span></a>';
	  	}
		cadena=cadena+'</div>';
		cadena=cadena+'<button type="button" id="btnUnir" class="btn btn-primary">Unir a Partida</button>';
		cadena=cadena+'</div>';


		$('#unirAPartida').append(cadena);

		var StoreValue = [];
	    $(".list-group a").click(function(){
	        StoreValue = [];
	        StoreValue.push($(this).attr("value")); // add text to array
	    });


		$('#btnUnir').on('click',function(){
			var nick=$('#nick').val();
			var codigo=StoreValue[0];
			$("#mUAP").remove();
			if(codigo!=undefined && nick!=""){
				ws.unirAPartida(codigo,nick);
			}
			else{
				ws.listaPartidasDisponibles();
			}
			
			//mostrarEsperandoRival
		});
	}

	this.mostrarIniciarPartida=function(){
		$('#mIP').remove();
		var cadena='<div id="mostrarIP">';
		cadena=cadena+'</div>';
		cadena=cadena+'<button type="button" id="btnIniciar" class="btn btn-primary">Iniciar Partida</button>';
		cadena=cadena+'</div>';

		$('#esperando').append(cadena);

		$('#btnIniciar').on('click',function(){
			ws.iniciarPartida();
		});
	}

	this.mostrarParticipantes=function(lista){
		$('#mP').remove();
		var cadena='<div id="mP">';
		cadena=cadena+'<h3>Listado Participantes</h3>';
		cadena=cadena+'<div class="list-group">';
		for(var i=0;i<lista.length;i++){
	  		cadena=cadena+'<li value="'+lista[i].nick+'" class="list-group-item">'+lista[i].nick+'</li>';
	  	}
		cadena=cadena+'</div>';
		//<input width="30" height="30" type="image" id="btnRefrescar" src="cliente/img/refresh.png" />
		cadena=cadena+'</div>';

		$('#uniendo').append(cadena);
	}

	this.actualizarJugadores=function(){
		ws.listarParticipantes();
	}

	this.actualizarPartidas=function(){
		ws.listaPartidasDisponibles();
	}

	this.limpiarLog=function(){
		$('#esperando').remove();
		$('#uniendo').remove();
	}

	this.limpiarJuego=function(){
		$('#mostrarRE').remove();
		$('#game-container').remove();
		var cadena='<div id="mostrarRE">';
		cadena=cadena+'<button type="button" id="btnReiniciar" class="btn btn-primary">REINICIAR</button>';
		cadena=cadena+'</div>';
		$('#bloqueCentral').append(cadena);

		$('#btnReiniciar').on('click',function(){
			location.reload();
			return false;
		});
	}

	this.mostrarModalSimple=function(msg){
		this.limpiarModal();
		var cadena="<p id='avisarImpostor'>"+msg+'</p>';
		$('#contenidoModal').append(cadena);
		$("#pie").append('<button type="button" id="cerrar" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>');
		$('#modalGeneral').modal("show");
	}

	this.mostrarModalTarea=function(cadenaTarea){
		this.limpiarModal();
		var cadena="<p id='tarea'>"+cadenaTarea+'</p>';
		//cadena=cadena+'<div id="progreso" class="progress">';
 		//cadena=cadena+'<div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width:40%"> 40% </div>';
 		//cadena=cadena+'</div>';
		$('#contenidoModal').append(cadena);
		$("#pie").append('<button type="button" id="cerrar" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>');
		$('#modalGeneral').modal("show");
	}

	this.mostrarModalVotacion=function(lista){
		this.limpiarModal();
		var cadena = '<div id="votacion"><h3>Votacion</h3>';
		cadena=cadena+'<div class="input-group">';
		for(var i=0;i<lista.length;i++){
	  		cadena=cadena+'<div><input type="radio" name="optradio" value="'+lista[i].nick+'">'+lista[i].nick+'</div>';
	  	}
	  	cadena=cadena+'<div><input type="radio" name="optradio" value="-1" checked>Saltar voto</div>'
		cadena=cadena+'</div>';
		$('#contenidoModal').append(cadena);
		$("#pie").append('<button type="button" id="votar" class="btn btn-secondary">Votar</button>');
		$('#modalGeneral').modal("show");
		$('#modalGeneral').modal({
    		backdrop: 'static',
    		keyboard: false
		});

		var sospechoso=$('input[name=optradio]:checked', '.input-group').val();
		$('.input-group input').on('change', function() {
		   sospechoso=$('input[name=optradio]:checked', '.input-group').val();
		});

		$('#votar').on('click',function(){
			if(sospechoso!=-1){
				ws.votar(sospechoso);
			}
			else{
				ws.saltarVoto();
			}
		});
	}

	this.limpiarModal=function(){
		$('#avisarImpostor').remove();
		$('#tarea').remove();
		$("#cerrar").remove();
		$("#votacion").remove();
		$("#votar").remove();
		$("#abandono").remove();
		$("#abandonar").remove();
		$("#mapaRural").remove();
		$("#mapaPiratas").remove();
		//$("#progeso").remove();
	}

	this.mostrarModalAbandonar=function(lista){
		this.limpiarModal();
		var cadena = '<div id="abandono"><h3>Abandonar</h3>';
		$('#contenidoModal').append(cadena);
		$("#pie").append('<button type="button" id="abandonar" class="btn btn-secondary">Abandonar Partida</button>');
		$("#pie").append('<button type="button" id="cerrar" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>');
		$('#modalGeneral').modal("show");

		$('#abandonar').on('click',function(){
			ws.abandonarPartida();
		});
	}

	this.reiniciarPagina=function(){
		location.reload(true);
	}

	this.mostrarModalMapa=function(cadenaMapa){
        this.limpiarModal();
        if(cadenaMapa=="rural"){
            var cadena="<img id='mapaRural' src='cliente/img/mapaRural.png' style='max-width:550px'>";
        }
        else{
            var cadena="<img id='mapaPiratas' src='cliente/img/mapaPiratas.png' style='max-width:550px'>";
        }
        $('#contenidoModal').append(cadena);
        $("#pie").append('<button type="button" id="cerrar" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>');
        $('#modalGeneral').modal("show");
    }


}