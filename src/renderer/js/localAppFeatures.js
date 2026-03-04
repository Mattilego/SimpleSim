try{
	if (nodeAPI !== undefined){
		console.log("Nodeintegration enabled");
	} else {
		console.log("Nodeintegration disabled")
	}
} catch {
	console.log("Nodeintegration disabled");
}
