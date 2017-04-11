
var programStarted = false;

var inquirer = require("inquirer");
var fs = require('fs');


function main() {
	console.log("\n");
	inquirer.prompt([
		{
		    type: "list",
	    	message: mainMessage(),
	    	choices: [
	    		"Create Card", 
	    		"View Cards",
	    		"Quit"
	    	],
	    	name: "command"
		}
	]).then(function(results) {

		switch (results.command) {
		  case "Create Card":
		    cardConstructor("main", main);
		    break;

		  case "View Cards":
		   	viewCards("main");
		    break;

		  case "Quit":
		    console.log("\nYou Quit Brian's Flash Card App.\n\n\n");
		    break;
		}
	});

}




function mainMessage() {
	var choices = [", Now", ", Next", ", This Time", ""];
	if(programStarted == true){ 
		return ("What Would You Like To Do"
			+choices[Math.floor(Math.random() * 4 )]+"?" );
	}else{ 
		programStarted = true; 
		return ("What Would You Like To Do?"); 
	}
}




function startUp() {
	console.log(
		"\n\n\n\n\n\n\n\n"
		+"Welcome to Brian's Flash Card App!\n"
		+returnHR() 
	);
	main();
}


startUp();


///////////////////////////////
//START
// CARD SPECIFIC FUNCTIONS
///////////////////////////////

function cardConstructor(WhatToDo, callback) {
	console.log("\n");
	if(WhatToDo == "main"){
		inquirer.prompt([
			{
			    type: "list",
		    	message: "Which Type Of Card Would You Like To Create?",
		    	choices: [
		    		"Basic", 
		    		"Cloze", 
		    		"Return To Main Menu"
		    	],
		    	name: "command"
			}
		]).then(function(results) {

			switch (results.command) {
				case "Basic": cardPrompt("basic"); 
				break;

				case "Cloze": cardPrompt("cloze"); 
			    break;

			    case "Return To Main Menu": main();
			    break;
			}

		});
	}
	
}

function BasicCard(type, front, back) {
	if(this instanceof BasicCard) {
		this.type = type;
		this.front = front;
		this.back = back;
	} else { return new BasicCard(type, front, back); }
}

function ClozeCard(type, fullText, cloze) {
	if(this instanceof ClozeCard) {
		this.type = type;
		this.fullText = fullText;
		this.cloze = cloze;
		this.partial = fullText.replace(cloze, "...");
	} else { return new ClozeCard(type, fullText, cloze); }
}


function cardPrompt(type) {
	inquirer.prompt([
		{
		    type: "input",
		    message: cardPrompt_Message(type, 1),
		    name: "user_input"
		}
	]).then(function(results) {

		if(results.user_input.trim() != ""){

			console.log("\n");

			inquirer.prompt([
			{
			    type: "input",
			    message: cardPrompt_Message(type, 2),
			    name: "user_input"
			}
			]).then(function(results2) {

				var newCard;
				if(type == "basic"){
					newCard = new BasicCard( "Basic", results.user_input, results2.user_input);
				}
				if(type == "cloze"){
					newCard = new ClozeCard( "Cloze", results.user_input, results2.user_input);
				}

				var str = JSON.stringify(newCard);

				if (fs.existsSync('cards.json')) {
					str = ","+JSON.stringify(newCard);
				}
				fs.appendFile('cards.json', str);

				console.log("\nNew "+type+" Card Created!\n" + returnHR() );

				main();

			});
		}else{
			cardPrompt(type);
		}

	});
}

function cardPrompt_Message(type, which) {
	if(type == "basic"){
		if(which == 1){ return "What question will go on this card's Front?"; }
		if(which == 2){ return "What is the answer to this card's Back?"; }
	}else if(type == "cloze"){ 
		if(which == 1){ return "What is the full text for this card?"; }
		if(which == 2){ return "What is the cloze deletion for this card?"; }
	}
}



function viewCards(WhatToDo) {
	fs.readFile('cards.json', "utf8", function(err, data) {
		if(err) throw err;
		var obj = JSON.parse("["+data+"]");
		// console.log(obj[0].type);

		if(WhatToDo == "main"){
			inquirer.prompt([
				{
				    type: "list",
			    	message: "Pick A Way To View A Card:",
			    	choices: [
			    		"View A Random Card", 
			    		"Type In A Card Number", 
			    		"Pick A Card From A List",
			    		"Return To Main Menu"
			    	],
			    	name: "command"
				}
			]).then(function(results) {

				switch (results.command) {
				  case "View A Random Card":
				   	var r = Math.floor(Math.random() * (obj.length-1) ) ;
				   	card_interactions(obj[r]);
				    break;

				  case "Type In A Card Number":
				    viewCards("input");
				    break;

				  case "Pick A Card From A List":
				   	viewCards("list");
				    break;

				  case "Return To Main Menu":
				    main();
				    break;
				}
			});
		}

		if(WhatToDo == "input"){
			inquirer.prompt([
			{
			    type: "input",
			    message: "\nWhich Card Would You Like To View? (1-"+(obj.length)+ ")\n",
			    name: "user_input"
			}
			]).then(function(results2) {

				var num = results2.user_input.trim();
				if( num != "" 
					&& !isNaN(num)
					&& parseInt( num-1) <= (obj.length-1) ){
					
					card_interactions( obj[ parseInt( num-1) ] );

				}else{
					console.log("\nThere Was A Problem With Your Input.\nPlease Try Again\n"+returnHR()+"\n");

					viewCards("main");
				}

			});
		}

		if(WhatToDo == "list"){
			inquirer.prompt([
				{
				    type: "list",
			    	message: "Pick A Card From This List:",
			    	choices: returnOBJ_List(obj.length, obj),
			    	name: "command"
				}
			]).then(function(result) {
				
				var card = result.command.split(" ")[1].substring(0,1) ;
				var c = ( parseInt(card) -1 );
				card_interactions(obj[c]);
			});
		}
	});

}


function card_interactions(card_Object) {
	// console.log(card_Object);
	inquirer.prompt([
		{
		    type: "list",
	    	message: "\nInteract With This "+card_Object.type+" Card?",
	    	choices: card_messages(card_Object.type),
	    	name: "command"
		}
	]).then(function(results) {

		switch (results.command) {

			// baisc card
		  case "View Card Front":
		  	console.log(card_Object.front);
		  	card_interactions(card_Object);
		    break;

		  case "View Card Back":
		    console.log(card_Object.back);
		    card_interactions(card_Object);
		    break;

		  //cloze card
		  case "View Card Cloze Text":
		  	console.log(card_Object.cloze);
		  	card_interactions(card_Object);
		    break;

		  case "View Partial Card Text":
		    console.log(card_Object.partial);
		    card_interactions(card_Object);
		    break;

		  case "View Full Card Text":
		    console.log(card_Object.fullText);
		    card_interactions(card_Object);
		    break;


		  case "Return To Main Menu":
		  	console.log(returnHR());
		    main();
		    break;
		}
	});

}


function card_messages(type) {
	var choices = [];

	if(type == "Basic"){
		choices = [
			"View Card Front", 
			"View Card Back", 
			"Return To Main Menu" ];
	}
	if(type == "Cloze"){
		choices = [
			"View Card Cloze Text", 
			"View Partial Card Text", 
			"View Full Card Text", 
			"Return To Main Menu" ];
	}
	return choices;
}

///////////////////////////////
//END
// CARD SPECIFIC FUNCTIONS
///////////////////////////////







//////////////////////////////
//START 
//RE-USABLE FUNCTIONS
//////////////////////////////

function returnOBJ_List(totalObjects, allObects) {
	var list = [];
	for (var i = 0; i < totalObjects; i++) {
		list.push("Card "+ (i+1) +": "+ allObects[i].type );
	}
	return list;
}

function returnHR() {
	var col = process.stdout.columns;
	var myHR = "";
	if(process.stdout.columns != null){
		for (var i = 0; i < col; i++) {
			myHR = myHR + "_";
		}
		return myHR;
	}
}
