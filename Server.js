const express = require("express");
const path = require("path");
const app = express();

// Specific route for index.html to serve GUI.html
app.get('/index.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'localGUI', 'GUI.html'));
});

app.get('/style.css', (req, res) => {
	res.sendFile(path.join(__dirname, 'localGUI', 'style.css'));
});

// Root route to serve GUI.html
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'localGUI', 'GUI.html'));
});


// Serve static files from localGUI directory
app.use(express.static(path.join(__dirname, 'webPage')));

app.listen(3000, () => {
	console.log("Server started on port 3000");
});

