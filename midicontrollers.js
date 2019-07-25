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
    if (document.getElementById("midi-display" === null)){
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
    invokers: {
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
        }
    },
    listeners : {
        onReady: {
            func: function(that){
                setTimeout( function(){
                    that.clearLCD()
                    that.sendRaw([176, 85, 1]); // dim play light 
                    /*that.send([176, 50, 1]); // dim play light 
                    that.send([176, 51, 1]); // dim play light 
                    that.send([176, 114, 1]); // dim play light 
                    that.send([176, 115, 1]); // dim play light 
                    for (var i = 36; i < 100; i++){
                        that.send([144, i, 100]); 
                    }*/
                }, 1000);
            
            },
            args: ["{that}"]
        }
    
    }
});



// ---------------------------------
// SETUP PUSH LIGHTS
// ---------------------------------
/* TODO - start by clearing them all */
/*
(function(){
    setTimeout( function(){
        abletonpush.send([176, 85, 1]); // dim play light 
        abletonpush.send([176, 50, 1]); // dim play light 
        abletonpush.send([176, 51, 1]); // dim play light 
        abletonpush.send([176, 114, 1]); // dim play light 
        abletonpush.send([176, 115, 1]); // dim play light 
        for (var i = 36; i < 100; i++){
            abletonpush.send([144, i, 100]); // dim play light 
        }
    }, 1000);
})();
*/




/*
 *  better way of sending and building messages. 
ableton.send({
    type: “sysex”,
    data: [71,127,21,28,0,0]
});
        */
