(function(){
    var thegrid = adam.grid();
    var ccc = controllertogridmapper();
});

fluid.defaults("controllertogridmapper", {
    gradeNames: ["fluid.modelComponent"], // push controller
    model: {
        mode: "sequence", // notes, envelope
        action: "add", // delete, mute, select?
    },
    components: { // all at the same time? 
        push: adam.pushconnection,
        quneo: adam.quneoconnection,
        //launchpad: null
    },
    listeners: {
       onCreate: {
           func: function(that){
               console.log('afkljlajf');
                flock.midi.requestPorts(foundports, porterror);
                function foundports(ports){
                    for( p of ports.inputs){
                        if ( p.name === "Ableton Push User Port" ){
                            window.pushr = adam.pushconnection();
                            //that.push = adam.pushconnection(); // ?
                        }
                        if ( p.name === "QUNEO" ){
                            window.quneo = adam.quneoconnection();
                            //that.quneo = adam.quneoconnection(); // ?
                        }
                    }
                }; 
                function porterror(error){console.log(error)};
           },
           args: ["{that}"]
       },
       /*
       gridaction: { 
           func: function(that, cell){
               if(that.model.mode = "grid") that.gridmapping(cell);
               if(that.model.mode = "notes") that.notemapping(cell);
           },
           args: ["{that}"],
       },
       */
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
                that.send({type: "control", number: 118, value: 1, channel: 0}); // delete button
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


                    /// TODO abstract
                    thegrid.addcell(pos);
                    that.writePad( pos.row, pos.column  );
                    var payload= {"func": "trig", "args": 200};
                    payload.location = pos;
                    addsequence([payload]);
                    ///
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



                ///TODO: decouple message from mapping to sequence adding
                // define a region 
                if (that.options.notedown !== undefined && that.options.notedown !== msg.note){

                    var startpoint, endpoint; 
                    if (msg.note < that.options.notedown){
                        startpoint = pushNotesToGrid (msg);
                        endpoint = pushNotesToGrid (that.options.notedown);
                    }else{
                        endpoint = pushNotesToGrid (msg);
                        startpoint = pushNotesToGrid (that.options.notedown);
                    };

                    // TODO: check how the region overlaps? 
                    if( thegrid.checkcelloverlap(pos) ) {
                        console.log(thegrid.checkcelloverlap(pos));
                        return;
                    };

                    // todo better payload additions 
                    var stepz = [];
                    var beats = endpoint.row - startpoint.row + 1;
                    //console.log(endpoint.row + ",", + startpoint.row);

                    for (var r = startpoint.row; r <= endpoint.row; r++){
                        if(endpoint.row !== startpoint.row){ 
                            stepz.push([]);// mutli beat row
                        }
                        for (var c = startpoint.column; c <= endpoint.column; c++){
                            var payload = {"func": "trig", "args": 1000};
                            payload.location = {row: r, column: c}; 
                            thegrid.addcell(payload.location); // bug?

                            if(endpoint.row === startpoint.row){
                                stepz.push(payload); // single beat sequence 
                            }else{
                                
                                stepz[r-startpoint.row].push(payload); //multi beat sequence
                            }
                            that.writePad(r, c);
                        }
                    }
                    
                    addsequence(stepz);

                    that.options.notedown = undefined;
                }else{
                    /// TODO Check if place exists on the grid
                    if( thegrid.checkcelloverlap(pos) ) {}
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
    var notenumber;
    if (typeof msg === "number")
        notenumber = msg;
    else
        notenumber = msg.note;

    return ({ 
        row: Math.floor(notenumber / 8),
        column:  notenumber % 8  // TODO FIX THIS
    });

};

function addsequence(stepz, pos){
    var s = adam.sequence();
    s.model.loop = true;
    s.settarget(selectedsynth());
    s.arraytosequence(stepz);
    a.addsequence(s);
    a.selectsequence(s); 
};


function launchpadNotesToGrid(msg){
    console.log("temp mapping");
    return({row:0, column:0});
};


fluid.defaults("adam.quneoconnection", {
    gradeNames: "flock.midi.connection",
    openImmediately: true,
    ports: {
        input: {
            name: "QUNEO"
        },
        output: {
            name: "QUNEO"
        }
    },
    notedown: undefined, 
    invokers: {
        writePad: { // todo two midi note assignment
            func: function( that, x = 0, y = 0, colour = 1){ // TODO: limit range? 
                var midimessage = {type: "noteOn", channel: 1, note: 2, velocity: colour}
                midimessage.note = ( x * 2 ) + ( y * 16 )+ 1;
                //console.log(midimessage);
                that.send(midimessage); 
            },
            args: ["{that}", "{arguments}.0","{arguments}.1", "{arguments}.2"]
        },
        clearPads: {
            func: function(that){
                for (var x = 0; x < 8; x++){
                    for(var y = 0; y < 8; y++){
                        that.writePad(x,y,0);
                    }
                }
            },
            args: ["{that}"]
        }
    },
    listeners: {
        onCreate: function(){console.log("Mapped to Preset 5 on the Quneo");},
        onReady: "{that}.clearPads",
        noteOn: {
            func: function(that, msg){
                var pos = quneoNotesToGrid(msg);
                if (that.options.notedown !== undefined && that.options.notedown !== msg.note){

                    var startpoint, endpoint; 
                    if (msg.note < that.options.notedown){
                        startpoint = quneoNotesToGrid(msg);
                        endpoint = quneoNotesToGrid (that.options.notedown);
                    }else{
                        endpoint = quneoNotesToGrid(msg);
                        startpoint = quneoNotesToGrid (that.options.notedown);
                    };

                    ////// TODO BIG PROBLEM
                    // TODO: check how the region overlaps? 
                    if( thegrid.checkcelloverlap(pos) ) {
                        console.log(thegrid.checkcelloverlap(pos));
                        return;
                    };

                    // todo better payload additions 
                    var stepz = [];
                    var beats = endpoint.row - startpoint.row + 1;
                    //console.log(endpoint.row + ",", + startpoint.row);

                    for (var r = startpoint.row; r <= endpoint.row; r++){
                        if(endpoint.row !== startpoint.row){ 
                            stepz.push([]);// mutli beat row
                        }
                        for (var c = startpoint.column; c <= endpoint.column; c++){
                            var payload = {"func": "trig", "args": 1000};
                            payload.location = {row: r, column: c}; 
                            thegrid.addcell(payload.location); // bug?

                            if(endpoint.row === startpoint.row){
                                stepz.push(payload); // single beat sequence 
                            }else{
                                
                                stepz[r-startpoint.row].push(payload); //multi beat sequence
                            }
                            that.writePad(r, c);
                        }
                    }
                    
                    addsequence(stepz);

                    that.options.notedown = undefined;
                }else{
                    /// TODO Check if place exists on the grid
                    if( thegrid.checkcelloverlap(pos) ) {}
                    that.options.notedown = msg.note;
                };
            },
            args: ["{that}", "{arguments}.0"]
        },
        noteOff: {
            func: function(that, msg){
                console.log(msg)
                that.options.notedown = undefined;
            },
            args: ["{that}", "{arguments}.0"]
        }
    }
});


//------------------------------------------
// grid to push mappings
//------------------------------------------
fluid.defaults("adam.pushState", {
    gradeNames: "fluid.modelComponent",
    model: {
        mode: "grid", // envelope, sequence, payload
        sequencePads: {
            "0": {
                enabled: false,
                colour: 98
            }
        },
        samplePads: {
            "0": {
                enabled: true
            }
        }
    },
    modelListeners:{},
    listeners: {
        addsequence: {
            funcName: "adam.pushState.addsequence",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        } // add sequence to sequencer 
    },
    invokers: {}
});

adam.pushState.addsequence = function(that, startpos, endpos){
    adam.grid.addsequence();
};

/*
(function(){
    flock.midi.requestPorts(foundports, porterror);
    function foundports(ports){
        for( p of ports.inputs){
            if ( p.name === "Ableton Push User Port" ){
                window.pushr = adam.pushconnection();
            }
            if ( p.name === "QUNEO" ){
                window.quneo = adam.quneoconnection();
            }
        }
    }; 
    function porterror(error){console.log(error)};
})()
*/
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
                    
