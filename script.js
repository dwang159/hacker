/*
*(c) Copyright 2011 Simone Masiero. Some Rights Reserved.
*This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 License
*/

var HINT_TIME = 300000
var QUESTIONS = ["what|What|why|Why|How|how"]
var PASSWORDS = ["open sesame|letmein|let me in|12345|pwd|password|passwd"]
var PLEASE = ["pls|please|Please"]
var LINUX = ["\\bls\\b|\\bcd\\b|\\bdir\\b|\\brm\\b"]
var GRANT = ["grant"]
var rtn= new RegExp("\n", "g"); // newline regex
var rts= new RegExp("\\s", "g"); // whitespace regex
var rtt= new RegExp("\\t", "g"); // tab regex
$(
	function(){
        $("#console").text(">> ");
		$( document ).keypress(
			function ( event ) {
				Typer.handlePress( event ); //Capture the keypress event and call the addText, this is executed on page load
			}
		);
		$( document ).keydown(
			function ( event ) {
                // override backspace and tab default behavior
                if (event.keyCode == 8 || event.keyCode == 9) {
                    event.preventDefault();
                    Typer.handlePress(event)
                }
                else if (event.keyCode == 27) {
                    Typer.hidepop();
                }
			}
		);
	}
);

var Typer={
    // code text
	text: null,
    // user input buffer
    buffer: ">> ",
    // timer for blinking cursor
	cursorTimer:null,
    // timer for hack mode check
    hackTimer:null,
    // timer for hint
    hintTimer:null,
    trollTimer:null,
    // keystroke rate counter
    keyRate:null,
    // last key pressed (for ignoring autorepeat)
    lastKey:0,
    // consecutive hack mode second counter
    consecutive:0,
    // access granted bool
    done:false,
	index:0, // current cursor position
	speed:2, // speed of the Typer
	file:"", //file, must be setted
    hackerMode:false,
    first:true,
	init: function(){// initialize Hacker Typer
        // initialize timer for blinking cursor
        cursorTimer = setInterval(function(){Typer.updLstChr();}, 500);
        // check hack mode every second
        hackTimer = setInterval(function(){Typer.checkHack();}, 1000);
        $.get(Typer.file,function(data){// get the text file
            Typer.text=data;// save the textfile in Typer.text
        });
	},

	content:function(){
		return $("#console").html();// get console content
	},

	write:function(str){// append to console content
		$("#console").append(str);
		return false;
	},

	makeAccess:function(){//create Access Granted popUp
		Typer.hidepop(); // hide all popups
		Typer.accessCount=0; //reset count
		var ddiv=$("<div id='gran'>").html(""); // create new blank div and id "gran"
		ddiv.addClass("accessGranted"); // add class to the div
		ddiv.html("<h1>ACCESS GRANTED</h1>"); // set content of div
		$(document.body).prepend(ddiv); // prepend div to body
        // empty buffer and set done to clear screen permanently
        Typer.buffer = "";
        Typer.done= true;
		$("#console").html("");
		return false;
	},


	makeHint:function(){//create Access Granted popUp
		Typer.hidepop(); // hide all popups
        clearInterval(Typer.hintTimer);
		var ddiv=$("<div id='hint'>").html(""); // create new blank div and id "gran"
		ddiv.addClass("accessGranted"); // add class to the div
		ddiv.html("<h1>GIT GUD, NOOB</h1><br><a target=\"_blank\" href=http://i.imgur.com/iVHfwLc.gifv>Click here for hint</a>, &lt;Esc&gt; to close"); // set content of div
		$(document.body).prepend(ddiv); // prepend div to body
		return false;
	},


	hidepop:function(){// remove all existing popups
		$("#gran").remove();
		$("#hint").remove();
	},

    // checks if the user is typing fast enough to enter hack mode
    checkHack:function(){
        if (Typer.keyRate > 15) {
            Typer.hackMode = true;
            Typer.consecutive += 1;
            // 4 seconds of hack mode grants access
            if (Typer.consecutive > 4) {
                Typer.makeAccess();
            }
        }
        else {
            // clear hack mode variables for slow typing
            Typer.hackMode = false;
            Typer.consecutive = 0;
            $("#console").html(Typer.buffer.replace(rtn,"<br/>").replace(
                rtt,"&nbsp;&nbsp;&nbsp;&nbsp;").replace(rts,"&nbsp;"));
        }
        // reset keystroke counter
        Typer.keyRate = 0;
    },

    getMessage:function(){
        pos = Typer.buffer.lastIndexOf("\n");
        if (pos == -1) {
            pos = 0;
        }
        cmd = Typer.buffer.slice(pos, Typer.buffer.length)
        if (cmd.match(QUESTIONS)) {
            return "THAT'S FOR ME TO KNOW AND YOU TO FIND OUT";
        }
        else if (cmd.match(PASSWORDS)) {
            Typer.done = true;
            Typer.trollTimer = setInterval(Typer.troll, 2000);
            return "PASSWORD ACCEPTED. ACCESS GRANTED!";
        }
        else if (cmd.match(PLEASE)) {
            Typer.done = true;
            Typer.trollTimer = setInterval(Typer.troll, 2000);
            return "WELL, SINCE YOU ASKED NICELY...";
        }
        else if (cmd.match(GRANT)) {
            Typer.done = true;
            Typer.trollTimer = setInterval(Typer.troll, 2000);
            return "OK, SURE!";
        }
        else if (cmd.match(LINUX)) {
            return "YOUR CS SKILLS ARE NO MATCH FOR MY PROGRAMMING";
        }
        return "ACCESS DENIED";
    },

    troll:function() {
        Typer.done = false;
        clearInterval(Typer.trollTimer);
        Typer.addText("\nJK LOL\nACCESS DENIED\n>> ")
    },

    handlePress:function(key){//Main function to add the code

        // Set up hint timer on first keypress
        if (Typer.first) {
            Typer.hintTimer = setInterval(function(){Typer.makeHint();}, HINT_TIME);
            Typer.first = false;
        }

        // Update typing rate
        if (key.keyCode != Typer.lastKey)
            Typer.keyRate += 1;

        Typer.lastKey = key.keyCode;

		if(!Typer.done){ // if text is loaded
			var cont=Typer.content(); // get the console content
            // if the last char is the blinking cursor
			if(cont.substring(cont.length-1,cont.length)=="|")
                // remove it before adding the text
				$("#console").html($("#console").html().substring(0,cont.length-1));

            if (Typer.hackMode) {
                // add speed to index
                Typer.index += Typer.speed;

                // parse the text for stripping html enities
                var text=$("<div/>").text(Typer.text.substring(0,
                        Typer.index)).html();

                // replace newline chars with br, tabs with 4 space and blanks with an html blank
                $("#console").html(text.replace(rtn,"<br/>").replace(
                    rtt,"&nbsp;&nbsp;&nbsp;&nbsp;").replace(rts,"&nbsp;"));
            }
            else {
                var c = String.fromCharCode(key.keyCode);
                // special hardcoded cases for some non alphanumeric keys
                if (key.keyCode == 13) {
                    // print denied message on <enter>
                    c = "\n" + Typer.getMessage() + "\n>> ";
                }
                else if (key.keyCode == 9) {
                    // input tab on <tab>
                    c = "\t";
                }
                else if (key.keyCode == 8) {
                    // delete one char on <backspace>
                    c = ""
                    if (!Typer.buffer.endsWith(">> ")) {
                        Typer.buffer = Typer.buffer.slice(0, -1);
                    }
                }
                Typer.addText(c);
            }
			window.scrollBy(0,50); // scroll to make sure bottom is always visible
		}
	},

    addText:function(c) {
        // add char to buffer and output
        Typer.buffer = Typer.buffer.concat(c)

        // handle terminal scrolling (add two newlines)
        if ((Typer.buffer.match(/\n/g)||[]).length > 40) {
            Typer.buffer = Typer.buffer.substring(
                Typer.buffer.indexOf("\n") + 1, Typer.buffer.length);
            Typer.buffer = Typer.buffer.substring(
                Typer.buffer.indexOf("\n") + 1, Typer.buffer.length);
        }
        var text = Typer.buffer;
        // replace newline chars with br, tabs with 4 space and
        // blanks with an html blank
        $("#console").html(text.replace(rtn,"<br/>").replace(
            rtt,"&nbsp;&nbsp;&nbsp;&nbsp;").replace(rts,"&nbsp;"));
    },

	updLstChr:function(){ // blinking cursor
		var cont=this.content(); // get console
		if(cont.substring(cont.length-1,cont.length)=="|") // if last char is the cursor
			$("#console").html($("#console").html().substring(0,cont.length-1)); // remove it
		else
            if (!Typer.done)
                this.write("|"); // else write it
	}
}
