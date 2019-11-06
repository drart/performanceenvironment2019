var thegrid = adam.grid();
console.log(thegrid);

fluid.defaults("controllertogridmapper", {
    gradeNames: ["fluid.modelComponent"], // push controller
    model: {
        mode: "grid", // notes, envelope
    },
    listeners: {
       gridaction: { 
           func: function(that, cell){
               if(that.model.mode = "grid") that.gridmapping(cell);
               if(that.model.mode = "notes") that.notemapping(cell);
           },
           args: ["{that}"],
       },
    },
    invokers: {
        gridmapping: {
            func: function(that, region){
                if ( Array.isArray(region) ){
                }else{
                }
            },
            args: ["{that}", "{arguments}.0"]
        },
        notemapping: {
            func: function(that, note){
                // selectedsynth.noteOn(note);
            },
            args: ["{that}", "{arguments}.0"]
        }
    }

});

fluid.defaults("adam.pushconnection", {
    gradeNames: ["flock.midi.connection"],
//var pushcontroller = flock.midi.connection({
    openImmediately: true,
    sysex: true,
    ports: {
        input: {
            name:"Ableton Push User Port" 
        },
        output: {
            name: "Ableton Push User Port" 
        }
    }, 
    notedown: undefined, 
    invokers: {
        writePad: {
            func: function(that, x = 0, y = 0, colour = 1){
                var midimessage = {type: "noteOn", channel: 0, note: 36, velocity: colour}
                midimessage.note = ( x * 8 ) + y + 36;
                that.send(midimessage); 
            },
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        },
    },
    listeners: {
        onReady: {
            func: function(that){
                // turn off all of the pad lights
                for(var x = 0; x < 8; x++){
                    for( var y = 0; y < 8; y++){
                        that.writePad(x,y,0);
                    }
                }
                that.send({type: "control", number: 85, value: 1, channel: 0}); // play button
                that.send({type: "control", number: 87, value: 1, channel: 0}); // new button
                that.send({type: "control", number: 40, value: 1, channel: 0}); // 1/16 button
                that.send({type: "control", number: 20, value: 10, channel: 0}); //  top strip
                that.send({type: "control", number: 21, value: 1, channel: 0}); //  top strip
                that.send({type: "control", number: 102, value: 1, channel: 0}); // bottom strip
            },
            args: ["{that}"]
        },
        noteOff: {
            func: function(that, msg){
                if (msg.note < 30){
                    // todo fire knob touched event 
                    return;
                } // todo: push knob touches send noteon and off
                if (msg.note === that.options.notedown){
                    var pos = pushNotesToGrid(msg);
                    that.writePad( pos.row, pos.column  );
                    var payload = {"func": "trig", "args": 200};
                    var s = adam.sequence();
                    s.model.loop = true;
                    s.settarget(selectedsynth());
                    s.arraytosequence([payload]); 
                    a.addsequence(s);
                    //a.selectsequence(s); //// BROKEN?!?!?
                    selectedsequence = s;
                    console.log("single");
                }
                that.options.notedown = undefined;
            },
            args: ["{that}", "{arguments}.0"]
        },
        noteOn: {
            func: function(that, msg){
                if (msg.note < 30){
                    // TODO  fire knob event
                    return;
                } // push knob touches send noteon and off

                /// check the grid
                //console.log(thegrid.checkcell(pushNotesToGrid(msg)));

                // define a region TODO: decouple message from mapping to sequence adding
                if (that.options.notedown !== undefined && that.options.notedown !== msg.note){

                    var startpoint, endpoint; 
                    if (msg.note < that.options.notedown){
                        startpoint = pushNotesToGrid (msg);
                        endpoint = pushNotesToGrid (that.options.notedown);
                    }else{
                        endpoint = pushNotesToGrid (msg);
                        startpoint = pushNotesToGrid (that.options.notedown);
                    };

                    ///////
                    // BIG TODO
                    // test grid for addition 
                    // ///

                    // todo better payload additions 
                    var payload = {"func": "trig", "args": 1000};
                    var stepz = [];

                    // fix: empty first index in array?
                    var beats = endpoint.row - startpoint.row + 1;
                    console.log(endpoint.row + ",", + startpoint.row);
                    for (var r = startpoint.row; r <= endpoint.row; r++){
                        if(endpoint.row !== startpoint.row){ 
                            stepz.push([]);// mutli beat row
                        }
                        for (var c = startpoint.column; c <= endpoint.column; c++){
                            if(endpoint.row === startpoint.row){
                                stepz.push(payload); // single beat sequence 
                            }else{
                                
                                stepz[r-startpoint.row].push(payload); //multi beat sequence
                            }
                            that.writePad(r, c);
                        }
                    }

                    /*
                    var sss = adam.sequence({
                        model: {
                            loop: true, 
                            target: 'synth', 
                            beats: beats,
                            steps: stepz
                        }
                    });
                    */
                    //console.log(sss);

                    var s = adam.sequence();
                    s.model.loop = true;
                    s.model.mute = (Math.random() > 0.1)? true : false;
                    if (s.model.mute) console.log('sequence is muted');
                    s.settarget(selectedsynth());
                    s.arraytosequence(stepz);

                    a.addsequence(s);

                    that.options.notedown = undefined;
                }else{
                    /// TODO Check if place exists on the grid
                    console.log(pushNotesToGrid(msg));
                    that.options.notedown = msg.note;
                };
            },
            args: ["{that}", "{arguments}.0"]
        },
        control: {
            func: function(that, msg){
                console.log(msg);
                if(msg.number === 85 && msg.value === 127){
                    a.play();
                }
                // change selected synth 
                if(msg.number === 20 ){
                    selectedsynth = adam.sawsynth;
                    that.send({type: "control", number: 20, value: 10, channel: 0}); //  top strip
                    that.send({type: "control", number: 21, value: 1, channel: 0}); //  top strip
                }
                if(msg.number === 21 ){
                    selectedsynth = adam.ticksynth;
                    that.send({type: "control", number: 20, value: 1, channel: 0}); //  top strip
                    that.send({type: "control", number: 21, value: 10, channel: 0}); //  top strip
                }

                if(msg.number >= 102 && msg.number <= 109){
                    // change selected payload
                }
            },
            args: ["{that}", "{arguments}.0"]
        }
    }
});

function pushNotesToGrid(msg){
    var notenumber; 
    if (typeof msg === "number")
        notenumber = msg;
    else
        notenumber = msg.note;

    return ({ 
        row: Math.floor((notenumber - 36) / 8),
        column: (notenumber-36) % 8 
    });
};

function quneoNotesToGrid(msg){
    return({row:0, column:0});
};
function launchpadNotesToGrid(msg){
    return({row:0, column:0});
};


fluid.defaults("adam.quneoconnection", {
    gradeNames: "flock.midi.connection",
    openImmediately: true,
    ports: {
        input: {
            name: "Quneo"
        },
        output: {
            name: "Quneo"
        }
    },
    invokers: {
        writePad: {
            func: function( that, x = 0, y = 0, colour = 1){
                var midimessage = {type: "noteOn", channel: 0, note: 2, velocity: colour}
                //that.send({type: "noteOn", note: 3, velocity: 100, channel: 1})
                //midimessage.note = ( x * 8 ) + y + 36;
                that.send(midimessage); // set up buttons
            },
            args: ["{that}", "{arguments}.0"]
        }
    },
    listeners: {
        //onCreate: function(){console.log("fkljasldfj");},
        noteOn: function(msg){console.log(msg)},
        noteOff: function(msg){console.log(msg)},
    }
});


/*
(function(){
    var portsavailable = flock.midi.logPorts();
    console.log(portsavailable);
    for(device of portsavailable.inputs){
        console.log(device.name);
    }
})()
*/
