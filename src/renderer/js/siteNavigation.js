document.querySelectorAll(".collapsibleDiv").forEach((div) => {
	div.style.maxHeight = div.scrollHeight+"px";
	document.getElementById("collapse"+div.id[0].toUpperCase()+div.id.slice(1,-9)).addEventListener("click", function() {
		div.style.maxHeight = (div.style.maxHeight == "0px")?div.scrollHeight+"px":"0px";
	});
})

document.addEventListener('mousedown', async function(e) {
    if (e.target.type === 'radio' && e.target.checked) {
        await new Promise(resolve => {
            const handleMouseUp = () => {
                document.removeEventListener('mouseup', handleMouseUp);
                resolve();
            };
            document.addEventListener('mouseup', handleMouseUp);
        });
        setTimeout(() => e.target.checked = false, 0);
    }
});

document.addEventListener('keydown', async function(e) {
	console.log(e.key);
    if (e.target.type === 'radio' && e.target.checked && e.key === "Enter") {
        await new Promise(resolve => {
            const handleKeyUp = () => {
                document.removeEventListener('keyup', handleKeyUp);
                resolve();
            };
            document.addEventListener('keyup', handleKeyUp);
        });
        setTimeout(() => e.target.checked = false, 0);
    } else {
		if (e.key === "Enter") {
			e.target.click();
		}
	}
});

if (document.getElementById("talents") !== null){
	document.querySelectorAll(".specRadio").forEach(radio => {
		radio.addEventListener("change", function() {
			updateTalentVisibility();
		});
	});

	function updateTalentVisibility() {
		let spec = document.querySelector(".specRadio:checked");
		let classTalentSections = document.querySelectorAll("#talents > div");
		classTalentSections.forEach(section => {
			section.style.display = "none";
		});
		if (spec.classList.contains("dkspec")) {
			document.getElementById("dkTalents").style.display = "grid";
			console.log(spec.id)
			switch (spec.id) {
				case "bloodDK":
					document.getElementById("bdkTalents").style.display = "grid";
					document.getElementById("fdkTalents").style.display = "none";
					document.getElementById("udkTalents").style.display = "none";
					document.getElementById("deathbringerHeroTalents").style.display = "grid";
					document.getElementById("sanLaynHeroTalents").style.display = "grid";
					document.getElementById("riderOfTheApocalypseHeroTalents").style.display = "none";
					break;
				case "frostDK":
					document.getElementById("fdkTalents").style.display = "grid";
					document.getElementById("bdkTalents").style.display = "none";
					document.getElementById("udkTalents").style.display = "none";
					document.getElementById("deathbringerHeroTalents").style.display = "grid";
					document.getElementById("sanLaynHeroTalents").style.display = "none";
					document.getElementById("riderOfTheApocalypseHeroTalents").style.display = "grid";
					break;
				case "unholyDK":
					document.getElementById("udkTalents").style.display = "grid";
					document.getElementById("bdkTalents").style.display = "none";
					document.getElementById("fdkTalents").style.display = "none";
					document.getElementById("deathbringerHeroTalents").style.display = "none";
					document.getElementById("sanLaynHeroTalents").style.display = "grid";
					document.getElementById("riderOfTheApocalypseHeroTalents").style.display = "grid";
					break;
			}
		}
	}
	updateTalentVisibility();
}

document.querySelectorAll(".positiveIntegerInput").forEach(input => {
	input.addEventListener("change", function(e) {
		console.log(e.target.value);
		e.target.value = Math.floor(e.target.value);
		console.log(e.target.value);
		const value = parseInt(e.target.value);
		if (typeof(value) !== "number" || value < 1) {
			e.target.value = 1;
		}
	});
});

document.querySelectorAll(".jsonInput").forEach((textArea) => {
	(new ResizeObserver(() => {
		console.log(textArea.parentElement.parentElement.scrollHeight);
		textArea.parentElement.parentElement.style.maxHeight = textArea.parentElement.parentElement.scrollHeight + "px";
	})).observe(textArea);
	textArea.addEventListener('keydown', (e) => {
		if (e.key === 'Tab') {
    		e.preventDefault();
    		const start = textArea.selectionStart;
    		const end = textArea.selectionEnd;

    		textArea.value = textArea.value.substring(0, start)+"\t"+textArea.value.substring(end);
    		textArea.selectionStart = textArea.selectionEnd = start + 1;
  		}
	});
});