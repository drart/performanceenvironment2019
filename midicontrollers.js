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
        anchor: null,
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

// write a basic MPE decoder and have it pair with a flock.band?
fluid.defaults("adam.midi.seaboard", {
    gradeNames: "flock.midi.connection",
    openImmediately: true,
    ports: {
        input: {
            name: "Seaboard BLOCK"
        }
    },
    model: {
        activevoices: []
    },
    listeners: {
        noteOn: {
            func: function(that, msg){
                that.options.model.activevoices[msg.channel] = msg;
            },
            args: ["{that}", "{arguments}.0"]
        },
        noteOff: {
            func: function(that,msg){
                that.options.model.activevoices[msg.channel] = undefined;
            },
            args: ["{that}", "{arguments}.0"]
        },
        pitchbend: {
            func: function(that,msg){
                if(that.options.model.activevoices[msg.channel] !== undefined)
                    that.options.model.activevoices[msg.channel].pitchbend = msg.value;
            },
            args: ["{that}", "{arguments}.0"]
        },
        control: {
            func: function(that,msg){
                if(that.options.model.activevoices[msg.channel] !== undefined)
                    that.options.model.activevoices[msg.channel].control = msg.value;
            },
            args: ["{that}", "{arguments}.0"]
        },
        aftertouch: {
            func: function(that,msg){
                if(that.options.model.activevoices[msg.channel] !== undefined)
                    that.options.model.activevoices[msg.channel].aftertouch = msg.pressure;
                console.log(that.options.model.activevoices[msg.channel]);
            },
            args: ["{that}", "{arguments}.0"]
        },
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


// Studiomux midi connection
fluid.defaults("adam.midi.ims20", {
    gradeNames: "flock.midi.connection",
    openImmediately: true,
    ports: {
        input: {
            name: "MS-20"
        }
    }
});



// TODO
// modelize the knobs? val, min, max, inc, stringprepend, stringappend -> pair with the screen?
//
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
    pedal1inverse : false,
    pedal2inverse : false,
    model : {
        lcdLine1 : "", // not used yet, add a change applier that does this automatically?
        lcdLine2 : "",
        lcdLine3 : "",
        lcdLine4 : "",
        knob1: 100, // change this to an object in the future?
        /*
        knob2: { // is this better?
            min: 0,
            max: 100,
            val: 50,
            inc: 1
        },
        */
        knob2: 100,
        knob3: 100,
        knob4: 100,
        knob5: 100,
        knob6: 100,
        knob7: 100,
        knob8: 100,
        volumeknob: 100,
        tempoknob: 100,
        swingknob: 100,
    },
    events: {
        knobTouched: null,
        knobReleased: null,
        padPushed: null,
        pedal1: null,
        pedal2: null,
    },
    invokers: {
        clearLine: {
            func: function (that, l = 0){
                if (typeof l === "number" && l < 4 && l >= 0) 
                    that.sendRaw([240,71,127,21,28+l,0,0,247]); 
            },
            args: ["{that}", "{arguments}.0"]
        },
        writePad: {
            func: function(that, x = 0, y = 0, colour = 1){
                var midimessage = {type: "noteOn", channel: 0, note: 36, velocity: colour}
                midimessage.note = ( x * 8 ) + y + 36;
                that.send(midimessage); // set up buttons
            },
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        },
        writeLCDRegion: {
            // why do i need length here? 
            func: function (that, thestring, length, line, region){
                if(typeof thestring != "string"){
                    thestring = thestring.toString();
                }
                if(typeof region != "number"){
                    region = 1;
                }
                /*
                if (thestring.length < length){
                    
                }
                */
                thestring = thestring.padEnd(length);
                that.writeLCD(thestring, line, ((region-1) * 8) + Math.floor(region/2));
            },
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
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
                if(typeof thestring != "string"){
                    thestring = thestring.toString();
                }
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
                    that.clearLCD();
                    that.writeLCD("Made by Ableton", 1, 27);
                    that.writeLCD("Powered by Flocking.js", 2, 24);

                    /*
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
                    */
            },
            args: ["{that}"]
        },
        noteOn : {
            func: function(that, msg){
                if (msg.note < 20){
                    that.events.knobTouched.fire(msg); // unroll this to knob and value?

                }else{
                    var notenumber = msg.note;
                    var row = Math.floor((notenumber - 36) / 8);
                    var column = (notenumber-36) % 8;
                    that.events.padPushed.fire( row, column, msg.velocity);
                } 
            },
            args: ["{that}", "{arguments}.0"]
        },
        control: {
            func: function(that, msg){
                if (msg.number > 70 && msg.number < 79){
                    that.options.model["knob" + (msg.number-70)] += msg.value > 64 ?  -(128-msg.value) : msg.value;
                    that.options.model["knob" + (msg.number-70)] = adam.clamp( that.options.model["knob" + (msg.number-70)], 0, 100 );
                }
                if (msg.number === 64){
                    var down = (that.options.pedal1inverse) ? 0 : 127 ;
                    var up = (that.options.pedal1inverse) ? 127 : 0;
                    if(msg.value === down ){
                        that.events.pedal1.fire("down");
                    }else{
                        that.events.pedal1.fire("up");
                    }
                }
                if (msg.number === 69){
                    var down = (that.options.pedal2inverse) ? 0 : 127 ;
                    var up = (that.options.pedal2inverse) ? 127 : 0;
                    if (msg.value === down){
                        that.events.pedal2.fire("down");
                    }else{
                        that.events.pedal2.fire("up");
                    }
                }
            }, 
            args: ["{that}", "{arguments}.0"]
        },
        aftertouch: function(msg){},
        pitchbend: function(msg){}
    },
    dynamicComponents: {},
    modelListeners: {},
});
