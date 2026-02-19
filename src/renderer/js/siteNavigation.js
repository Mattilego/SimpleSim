document.getElementById("collapseSpecSettings").addEventListener("click", function() {
	document.getElementById("specConfigurationContainer").style.maxHeight = (document.getElementById("specConfigurationContainer").style.maxHeight == "0px")?document.getElementById("specConfigurationContainer").style.height:"0px";
});

document.getElementById("collapseCharacterSettings").addEventListener("click", function() {
	document.getElementById("characterStatsContainer").style.maxHeight = (document.getElementById("characterStatsContainer").style.maxHeight == "0px")?document.getElementById("characterStatsContainer").style.height:"0px";
});

document.getElementById("collapseEnemySettings").addEventListener("click", function() {
	document.getElementById("enemySettingsContainer").style.maxHeight = (document.getElementById("enemySettingsContainer").style.maxHeight == "0px")?document.getElementById("enemySettingsContainer").style.height:"0px";
});

document.getElementById("collapseFightSettings").addEventListener("click", function() {
	document.getElementById("fightSettingsContainer").style.maxHeight = (document.getElementById("fightSettingsContainer").style.maxHeight == "0px")?document.getElementById("fightSettingsContainer").style.height:"0px";
});

document.getElementById("collapseResults").addEventListener("click", function() {
	document.getElementById("resultsContainer").style.maxHeight = (document.getElementById("resultsContainer").style.maxHeight == "0px")?document.getElementById("resultsContainer").style.height:"0px";
});

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

document.querySelectorAll(".positiveIntegerInput").forEach(input => {
	input.addEventListener("change", function(e) {
		console.log(e.target.value);
		e.target.value = Math.floor(e.target.value);
		console.log(e.target.value);
		if (typeof(e.target.value) !== "number" || e.target.value < 1) {
			e.target.value = 1;
		}
	});
});

updateTalentVisibility();