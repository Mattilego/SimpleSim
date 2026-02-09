const express = require("express");
const path = require("path");
const app = express();

app.get('/blockly/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules', 'blockly', req.params[0]));
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'localGUI', 'GUI.html'));
});

app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, 'localGUI', req.params[0]));
});

// Serve static files from localGUI directory
app.use(express.static(path.join(__dirname, 'webPage')));

app.listen(3000, () => {
	console.log("Server started on port 3000");
});

