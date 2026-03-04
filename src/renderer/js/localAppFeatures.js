
try{
	if (window.nodeAPI !== undefined){
		console.log("Nodeintegration enabled");
	} else {
		console.log("Nodeintegration disabled")
	}
} catch (e) {
	console.log("Nodeintegration disabled");
}
