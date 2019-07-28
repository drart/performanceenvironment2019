/////////////////////////////////////////////
//  Controller Utilities
/////////////////////////////////////////////
fluid.defaults("adam.midi.console", {
    listeners: {
        "noteOn.log": function(msg){
            console.log(msg);
        },
        "noteOff.log": function(msg){
            console.log(msg);
        },
        "control.log": function(msg){
            console.log(msg);
        },
        "aftertouch.log": function(msg){
            console.log(msg)
        },
        "pitchbend.log": function(msg){
            console.log(msg)
        }
    }
});

fluid.defaults("adam.midi.domlog", {
    model: {
        domElement: null
    }, 
    invokers: {
        creator: {
            funcName: "adam.midi.domlog.ready",
            args: ["{that}"]
        },
        printor: {
            func: function(that, msg){
                if(msg.type === "noteOn"){
                    $("#" + that.id + "-noteon").text(fluid.prettyPrintJSON(msg));
                }
                if(msg.type === "noteOff"){
                    $("#" + that.id + "-noteoff").text(fluid.prettyPrintJSON(msg));
                }
                if(msg.type === "control"){
                    $("#" + that.id + "-cc").text(fluid.prettyPrintJSON(msg));
                }
                if(msg.type === "aftertouch"){
                    $("#" + that.id + "-aftertouch").text(fluid.prettyPrintJSON(msg));
                }
                if(msg.type === "pitchbend"){
                    $("#" + that.id + "-pitchbend").text(fluid.prettyPrintJSON(msg));
                }
            },
            args: ["{that}", "{arguments}.0"]
        }
    },
    listeners: {
        "noteOn.domlog": "{that}.printor",
        "noteOff.domlog": "{that}.printor",
        "control.domlog": "{that}.printor",
        "aftertouch.domlog": "{that}.printor",
        "pitchbend.domlog": "{that}.printor",
        "onReady.preapredom": "{that}.creator",
    }
});

adam.midi.domlog.ready = function(that){
    if (document.getElementById("midi-display") === null){
        console.log("midi display dom element does not exist");
    }
    that.options.domElement = $("<div/>");
    that.options.domElement.text( that.options.model.portname );
    that.options.domElement.appendTo("#midi-display");
    $("<div/>").attr("id", that.id+"-label").text(that.options.ports.input.name).appendTo(that.options.domElement);
    $("<div/>").attr("id", that.id+"-noteon").appendTo(that.options.domElement);
    $("<div/>").attr("id", that.id+"-noteoff").appendTo(that.options.domElement);
    $("<div/>").attr("id", that.id+"-cc").appendTo(that.options.domElement);
    $("<div/>").attr("id", that.id+"-aftertouch").appendTo(that.options.domElement);
    $("<div/>").attr("id", that.id+"-pitchbend").appendTo(that.options.domElement);
};

/////////////////////////////////////////////
//  Controllers
/////////////////////////////////////////////
fluid.defaults("adam.midi.quneo", {
    gradeNames: "flock.midi.connection", 
    openImmediately: true,
    ports: {
        input: {
            name : "QUNEO",
        }
    }
});

fluid.defaults("adam.midi.boppad", {
    gradeNames: "flock.midi.connection",
    openImmediately: true,
    ports: {
        input: {
            name: "BopPad"
        }
    }
});

fluid.defaults("adam.midi.bcr2000", {
    gradeNames: "flock.midi.connection",
    openImmediately: true,
    ports: {
        input: {
            name: "BCF2000 Port 1"
        }
    }
});

fluid.defaults("adam.midi.push", {
    // ------------------
    // midi setup
    // ------------------
    gradeNames: "flock.midi.connection",
    sysex: true,
    openImmediately: true,
    ports: {
        input: {
            name : "Ableton Push User Port"
        },
        output: {
            name : "Ableton Push User Port"
        }
    },
    // ------------------
    // infusion setup
    // ------------------
    model : {
        lcdLine1 : "", // not used yet, add a change applier that does this automatically?
        lcdLine2 : "",
        lcdLine3 : "",
        lcdLine4 : "",
    },
    invokers: {
        //knobTouched: {},
        //knobReleased: {},
        clearLine: {
            func: function (that, l = 0){
                if (l < 4)
                    that.sendRaw([240,71,127,21,28+l,0,0,247]); // 
            },
            args: ["{that}", "{arguments}.0"]
        },
        clearLCD: {
            func: function(that){
                that.clearLine(0)
                that.clearLine(1)
                that.clearLine(2)
                that.clearLine(4)
            },
            args: ["{that}"]
        },
        // 240,71,127,21,<24+line(0-3)>,0,<Nchars+1>,<Offset>,<Chars>,247
        // 240,71,127,21,25,0,13,4,"Hello World",247
        writeLCD: {
            func: function(that, thestring="test", line = 0, offset = 0 ){
                var thestringinascii = []; 
                for(var i = 0; i < thestring.length; i++){
                    thestringinascii[i] = thestring.charCodeAt(i);
                }
                mysysexmessage = [240, 71, 127, 21];
                mysysexmessage.push(24 + line, 0);
                mysysexmessage.push(thestring.length + 1, offset);
                mysysexmessage.push(...thestringinascii);
                mysysexmessage.push(247);
                that.sendRaw( mysysexmessage );
                return(mysysexmessage);
            },
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        }
    },
    listeners : {
        onReady: {
            func: function(that){
                //setTimeout( function(){// do I really need the delay anymore?
                    that.clearLCD();
                    that.writeLCD("Made by Ableton", 1, 27);
                    that.writeLCD("Powered by Flocking.js", 2, 24);
                    var midimessage = {type: "noteOn", channel: 0, note: 36, velocity: 100}
                    for (var i = 36; i < 100; i++){
                        midimessage.note = i;
                        that.send(midimessage); // set up buttons
                    }
                    var midimessage = {type: "control", channel: 0, number: 36, value: 100}
                    for(var i = 85; i < 91; i++){
                        midimessage.number = i;
                        midimessage.value = 1;
                        that.send(midimessage)
                    }
                    for(var i = 102; i < 120; i++){
                        midimessage.number= i;
                        that.send(midimessage)
                    }
                    for(var i = 19; i < 30; i++){
                        midimessage.number= i;
                        that.send(midimessage)
                    }
                    for(var i = 36; i < 64; i++){
                        midimessage.number= i;
                        that.send(midimessage)
                    }
                    midimessage.number = 9;
                    that.send(midimessage)
                    midimessage.number = 3;
                    that.send(midimessage)
                    /*that.send([176, 50, 1]); // dim play light 
                    that.send([176, 51, 1]); // dim play light 
                    that.send([176, 114, 1]); // dim play light 
                    that.send([176, 115, 1]); // dim play light 
                    */
                //}, 1000);
            
            },
            args: ["{that}"]
        },
        noteOn : function(msg){},
        control: function(msg){
            if(msg.number === 71){
                console.log("knobbbby");
            }
        }, 
        aftertouch: function(msg){}
    }
});




/*
 *  better way of sending and building messages. 
ableton.send({
    type: “sysex”,
    data: [71,127,21,28,0,0]
});
        */
