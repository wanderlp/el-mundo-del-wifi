//variables globales
var Neuron = synaptic.Neuron,
	Layer = synaptic.Layer,
	Network = synaptic.Network,
	Trainer = synaptic.Trainer,
	Architect = synaptic.Architect;
      	
// define las capas de la red neuronal
var capaEntrada; //capa de entrada
var capaOculta; //capa oculta
var capaSalida; //cada de salida
var redNeuronal; //red neuronal
var instinto = []; //matriz de instinto, lo que sabe antes de conocer un lugar

var movimiento = false;

/*******************************************************************************************
                                  ELEMENTOS DE CARGA INICIAL
*******************************************************************************************/

cargar = function() {
	var canvas = document.getElementById("canCasa");
	var ctx = canvas.getContext("2d");
	
	var background = new Image();
	background.src = "img/plano.png";

	background.onload = function()
	{
    	ctx.drawImage(background,0,0);   
	}
	
	cargarChart();
};

/*******************************************************************************************
                                  CARGA EL GOOGLE CHART
*******************************************************************************************/
cargarChart = function() {
var arregloRojo = document.getElementById('arregloRojo');
var arregloAzul = document.getElementById('arregloAzul');
var jsonRojo = JSON.parse(arregloRojo.getAttribute("value"));
var jsonAzul = JSON.parse(arregloAzul.getAttribute("value"));
console.log(jsonRojo);
console.log(jsonAzul);
var data = [
    {
      label: 'Castigos',
      strokeColor: '#92000C',
      pointColor: '#92000C',
      pointStrokeColor: '#fff',
      data: jsonRojo
    },
    {
      label: 'Premios',
      strokeColor: '#007ACC',
      pointColor: '#007ACC',
      pointStrokeColor: '#fff',
      data: jsonAzul
    }
  ];

var options = {
          // SUPPORTED GLOBAL OPTIONS

// Boolean - If we should show the scale at all
showScale: true,

// String - Colour of the scale line
scaleLineColor: "rgba(0,0,0,.1)",

// Number - Pixel width of the scale line
scaleLineWidth: 1,

// Boolean - Whether to show labels on the scale
scaleShowLabels: true,

// String - Message for empty data
emptyDataMessage: "No hay datos que mostrar.",		

// SCALE

// Boolean - Whether grid lines are shown across the chart
scaleShowGridLines: true,

// Number - Width of the grid lines
scaleGridLineWidth: 1,

// String - Colour of the grid lines
scaleGridLineColor: "rgba(0,0,0,.05)",

// Boolean - Whether to show horizontal lines (except X axis)	
scaleShowHorizontalLines: true,

// Boolean - Whether to show vertical lines (except Y axis)
scaleShowVerticalLines: true,

// SCALE RANGE

// Boolean - If we want to override with a hard coded scale
scaleOverride: false,

// ** Required if scaleOverride is true **
// Number - The number of steps in a hard coded scale
scaleSteps: null,

// Number - The value jump in the hard coded scale
scaleStepWidth: null,

// Number - The scale starting value
scaleStartValue: 0,
scaleBeginAtZero: true,

// DATE SCALE

// String - scale type: "number" or "date"
scaleType: "number",

// Boolean - Whether to use UTC dates instead local
useUtc: true,

// String - short date format (used for scale labels)
scaleDateFormat: "mmm d",

// String - short time format (used for scale labels)
scaleTimeFormat: "h:MM",

// String - full date format (used for point labels)
scaleDateTimeFormat: "mmm d, yyyy, hh:MM",

// LINES

// Boolean - Whether to show a stroke for datasets
datasetStroke: true,

// Number - Pixel width of dataset stroke
datasetStrokeWidth: 2,

// String - Color of dataset stroke
datasetStrokeColor: '#007ACC',

// String - Color of dataset stroke
datasetPointStrokeColor: 'white',

// Boolean - Whether the line is curved between points
bezierCurve: true,

// Number - Tension of the bezier curve between points
bezierCurveTension: 0.4,

// POINTS

// Boolean - Whether to show a dot for each point
pointDot: true,

// Number - Pixel width of point dot stroke
pointDotStrokeWidth: 1,

// Number - Radius of each point dot in pixels
pointDotRadius: 4
        };
        
        var ctx = document.getElementById("grafica").getContext("2d");
        new Chart(ctx).Scatter(data, options);

};

/*******************************************************************************************
                                  INICIA LA SIMULACION
*******************************************************************************************/
iniciar = function() {
	
	redNeuronal = null;
	
	// crea las capas
	capaEntrada = new Layer(2); //dos entradas: x,y
	capaOculta = new Layer(document.getElementById('rngNeuronas').value); //capa oculta con la cantidad de neuronas especificadas
	capaSalida = new Layer(1); //una salida entre 0 y 1
	
	// crea las conexiones
	capaEntrada.project(capaOculta); // la de entrada con la oculta
	capaOculta.project(capaSalida); // la oculta con la de salida

	// crea la red neuronal
	redNeuronal = new Network({
    	input: capaEntrada,
	    hidden: [capaOculta],
    	output: capaSalida
	});
	
	//deshabilita los controles de la cantidad de neuronas
	document.getElementById('txtNeuronas').disabled = true;
	document.getElementById('rngNeuronas').disabled = true;
	document.getElementById('btnIniciar').disabled = true;
	document.getElementById('btnDetener').disabled = false;
	document.getElementById('btnSimular').disabled = false;
	document.getElementById('txtX').disabled = false;
	document.getElementById('txtY').disabled = false;
	document.getElementById('txtAceptacion').disabled = false;
	document.getElementById('rngAceptacion').disabled = false;
	
	simular();
};

/*******************************************************************************************
                                  DETIENE LA SIMULACION
*******************************************************************************************/
detener = function() {

	//habilita los controles de la cantidad de neuronas
	document.getElementById('txtNeuronas').disabled = false;
	document.getElementById('rngNeuronas').disabled = false;
	document.getElementById('btnIniciar').disabled = false;
	document.getElementById('btnDetener').disabled = true;
	document.getElementById('btnSimular').disabled = true;
	document.getElementById('txtX').disabled = true;
	document.getElementById('txtY').disabled = true;
	document.getElementById('btnPegar').disabled = true;
	document.getElementById('btnPremiar').disabled = true;
	document.getElementById('txtAceptacion').disabled = true;
	document.getElementById('rngAceptacion').disabled = true;
};

/*******************************************************************************************
                                  SIMULA Y GENERA POSICIONES ALEATORIAS
*******************************************************************************************/
simular = function() {

	//limpia el popo'
	var popo = document.getElementById('popo');
	popo.style.visibility = 'hidden';

	var x = 0; //posible posicion en X
	var y = 0; //posible posicion en Y
	var i = 0; //iteraciones
	var activacion = 0; //valor de activacion
	var aceptacion = document.getElementById('rngAceptacion').value; //valor de aceptacion
	
	// calcula las coordenadas hasta aceptarse o hasta lo indicado en las iteraciones
	for (i = 1; i <= document.getElementById('rngIteraciones').value; i++)
	{
		x = Math.round(Math.random() * 100);
		y = Math.round(Math.random() * 100);
		activacion = redNeuronal.activate([(x / 100), (y / 100)]);
		
		// si el valor de activacion es aceptado, se sale
		if (activacion[0] >= ((document.getElementById('rngAceptacion').value) / 100 )) 
		{
			i++; //suma una iteracion
			break; //se sale
		}
	}
	
	i--; //resta una iteracion

	document.getElementById('txtX').value = x; //actualiza x
	document.getElementById('txtY').value = y; //actualiza y
	document.getElementById('lblActivacion').innerHTML = "Valor de activaci&oacute;n: " + (activacion * 100) + " en " + i + " iteraciones."; // actualiza el mensaje
	moverChucho(x, y);
	
	//habilita los botones de aprendizaje
	document.getElementById('btnPegar').disabled = false;
	document.getElementById('btnPremiar').disabled = false;
	
	generaMapa();
};

/*******************************************************************************************
                                  LE PEGA AL CHUCHO PARA QUE NO ORINE EN X,Y
*******************************************************************************************/
moverChucho = function(x, y) {

	movimiento = true;

	var step=4; // Change this step value
	x = (x * step) - 100;
	y = (y * step) - 72;
	
	var posy = document.getElementById('chucho').offsetTop;
	var posx = document.getElementById('chucho').offsetLeft;
	
	if (x != posx || y != posy)
	{
		//movimiento horizontal
		if(x < posx)
		{
			posx = posx - 1;
			document.getElementById('chucho').style.left= posx + "px"; 
		}
		else if (x > posx)
		{
			posx = posx + 1;
			document.getElementById('chucho').style.left= posx + "px"; 
		}
	
		//movimiento vertical
		if(y < posy)
		{
			posy = posy - 1;
			document.getElementById('chucho').style.top= posy + "px"; 
		}
		else if (y > posy)
		{
			posy = posy + 1;
			document.getElementById('chucho').style.top= posy + "px"; 
		}
		
		//inicia el timer
		var t = setTimeout("moverChucho(" + ((x + 100) / step) + ", " + ((y + 72) / step) + ")", 5); //cada 10 ms
	}
	else
	{
		movimiento = false;		
		var t = clearTimeout(t); //detiene el timer
		
		//hace popo'
		var popo = document.getElementById('popo');
		popo.style.visibility = 'visible';
		popo.style.left = (posx + 90) + "px"; 
		popo.style.top = (posy + 60) + "px"; 
	}
	
};

/*******************************************************************************************
                                  LE PEGA AL CHUCHO PARA QUE NO ORINE EN X,Y
*******************************************************************************************/
pegar = function(x, y) {
	
	this.aprender(x / 100, y / 100, 0); //le ensenia con valor 0, es decir, que NO

};

/*******************************************************************************************
                                  PREMIA AL CHUCHO PARA QUE SI' ORINE EN X,Y
*******************************************************************************************/
premiar = function(x, y) {

	var audio = new Audio('ladrar.mp3');
	audio.play();
	
	document.getElementById('casa').style.cursor = "url('img/galleta.png'), default";
	aprender(x / 100, y / 100, 1); //le ensenia con valor 1, es decir, que SI'
	
};

/*******************************************************************************************
                                  APRENDER
*******************************************************************************************/

aprender = function(x, y, s) { //posicion x,y y salida

	var learningRate = document.getElementById('rngAprendizaje').value / 100; //tasa de aprendizaje	

	//propaga segun las iteraciones definidas
	for (var i = 0; i < document.getElementById('rngIteraciones').value; i++)
	{

				redNeuronal.activate([x, y]);
				redNeuronal.propagate(learningRate, [s]);
	}

	// Guarda la informacion de la grafica
	var arregloRojo = document.getElementById('arregloRojo');
	var arregloAzul = document.getElementById('arregloAzul');
	var jsonRojo = JSON.parse(arregloRojo.getAttribute("value"));
	var jsonAzul = JSON.parse(arregloAzul.getAttribute("value"));
	if (s == 0)
		jsonRojo.push({x: x * 100, y: (100 - (y * 100))});
	else
		jsonAzul.push({x: x * 100, y: (100 - (y * 100))});
	arregloRojo.setAttribute("value", JSON.stringify(jsonRojo));
	arregloAzul.setAttribute("value", JSON.stringify(jsonAzul));
	cargarChart();
};

/*******************************************************************************************
                                  CUANDO HACE CLICK ABAJO
*******************************************************************************************/
clickAbajo = function(e) {
	
	if (!movimiento)
	{
		e = e || window.event;
  	
	  	switch (e.which) {
    		case 1: 
    			document.getElementById('casa').style.cursor = "url('img/prensa2_small.png'), default";
    			pegar(document.getElementById('txtX').value, document.getElementById('txtY').value);
	    		break;
    		case 3:
    			document.getElementById('casa').style.cursor = "url('img/galleta.png'), default";
    			premiar(document.getElementById('txtX').value, document.getElementById('txtY').value);
	    		break; 
  		}
  	
	  	simular();
	  }
	
};

/*******************************************************************************************
                                  CUANDO HACE CLICK ARRIBA
*******************************************************************************************/
clickArriba = function(e) {
	
	e = e || window.event;
  	
  	switch (e.which) {
    	case 1: 
    		document.getElementById('casa').style.cursor = "url('img/prensa_small.png'), default";
    		break;
    	case 3:
    		document.getElementById('casa').style.cursor = "url('img/galleta.png'), default";
    		break; 
  	}
	
};

/*******************************************************************************************
                                  GENERA MAPA
*******************************************************************************************/

generaMapa = function() {
	document.getElementById('heatmapArea').innerHTML = "";
	
	// configuracion minima del mapa de calor
	var heatmapInstance = h337.create({
  		container: document.getElementById('heatmapArea'), // solo el contenedor es requerido, lo demas va por defecto
  		opacity: .5
	});

	var points = [];
	var ancho = 400;
	var alto = 400;
	var valor = 0;

	for (x1 = 0; x1 <= 1.0; x1=x1+0.01)
	{
		for (y1 = 0; y1 <= 1.0; y1=y1+0.01)
		{
			valor = redNeuronal.activate([x1, y1]);
			//valor = x1 * y1;
			var point = {
    			x: x1 * ancho,
	    		y: y1 * alto,
		    	value: valor[0],
		    	radius: 8
			};
			points.push(point);
		}
	}
	
	// heatmap data format
	var data = { 
  		max: 1, 
	  data: points 
	};
// if you have a set of datapoints always use setData instead of addData
// for data initialization
heatmapInstance.setData(data);   

	
}

/*******************************************************************************************
                                  EVENTOS DE LOS CONTROLES
*******************************************************************************************/

//cuando cambia el texto de cantidad de neuronas
cambiarTxtNeuronas = function(x) {
    document.getElementById('rngNeuronas').value = x; //cambia la barra
};

//cuando cambia la barra de cantidad de neuronas
cambiarRngNeuronas = function(x) {
    document.getElementById('txtNeuronas').value = x; //cambia el texto
};

//cuando cambia el texto de tasa de aprendizaje
cambiarTxtAprendizaje = function(x) {
    document.getElementById('rngAprendizaje').value = x; //cambia la barra
};

//cuando cambia la barra de tasa de aprendizaje
cambiarRngAprendizaje = function(x) {
    document.getElementById('txtAprendizaje').value = x; //cambia el texto
};

//cuando cambia el texto de cantidad de iteraciones
cambiarTxtIteraciones = function(x) {
    document.getElementById('rngIteraciones').value = x; //cambia la barra
};

//cuando cambia la barra de tasa de aprendizaje
cambiarRngIteraciones = function(x) {
    document.getElementById('txtIteraciones').value = x; //cambia el texto
};

//cuando cambia el texto de tasa de aceptacion
cambiarTxtAceptacion = function(x) {
    document.getElementById('rngAceptacion').value = x; //cambia la barra
};

//cuando cambia la barra de tasa de aceptacion
cambiarRngAceptacion = function(x) {
    document.getElementById('txtAceptacion').value = x; //cambia el texto
};