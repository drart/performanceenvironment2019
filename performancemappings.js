/////////////////////////////////////////////
//  Controller Mappings
/////////////////////////////////////////////

fluid.defaults("adam.midi.push.august2019", {
    //gradeNames: ["adam.midi.push",  "adam.midi.console"],
    gradeNames: ["adam.midi.push", "adam.midi.domlog", "adam.midi.console"],
    pedal1inverse: true,
    mode: "play",
    listeners:{ 
        onReady: {
            func: function (that){
                for(var i = 1; i < 9; i++){
                    that.writeLCDRegion(that.options.model["knob" + i], 8, 0, i);
                }
                for (var i = 0; i < 8; i++){
                    that.writePad(0,i,1);
                }
            },
            args: ["{that}"]
        },
        noteOn: function (msg) {
            //if (that.options.mode === "play"){
            //}
            if (msg.note >= 44 && msg.note <= 100){
                /*
                somesynth.set({
                    
                });
                */
            }
            switch (msg.note){
                case 36:     
                    sample1.noteOn(msg.velocity/127);
                    break;
                case 37:     
                    sample2.noteOn(msg.velocity/127);
                    break;
                case 38:     
                    sample3.noteOn(msg.velocity/127);
                    break;
                case 39:     
                    sample4.noteOn(msg.velocity/127);
                    break;
                case 40:     
                    sample5.noteOn(msg.velocity/127);
                    break;
                case 41:     
                    sample6.noteOn(msg.velocity/127);
                    break;
                case 42:     
                    sample7.noteOn(msg.velocity/127);
                    break;
                case 43:     
                    sample8.noteOn(msg.velocity/127);
                    break;
                default: 
                    break;
            }
        },
        noteOff: function (msg) {
        },
        control: {
            func: function (that, msg) {
            if(msg.number=== 85 && msg.value === 127){
                console.log(gs.isPlaying());
                var mymessage = {type: "control", channel: 0, number: 85, value: 1};
                if( gs.isPlaying() ){
                    gs.pause();
                    // need a better way to send light messages
                    that.send(mymessage);
                }else{
                    gs.play();
                    mymessage.value = 127;
                    that.send(mymessage);
                }
            }
            // the knobs
            if(msg.number >  70 && msg.number < 79) {
                var knob = msg.number - 70;
                that.writeLCDRegion(that.options.model["knob" + knob], 8, 0, knob);
                gs.setProb(that.options.model["knob" + knob]  / 100, 0);
            }
            },
            args: ["{that}", "{arguments}.0"]
        },
        pedal1: function(state){
            if (state === "down"){
                pedalkick.noteOn();
            }
            if (state === "up"){
            }

        },
        pitchbend : function (msg){
        }
    }
});


fluid.defaults("adam.midi.push.july2019", {
    gradeNames: ["adam.midi.push", "adam.midi.domlog", "adam.midi.console"],
    listeners:{ 
        onReady: {
            func: function (that){
                for(var i = 1; i < 9; i++){
                    that.writeLCDRegion(that.options.model["knob" + i], 8, 0, i);
                }
                window.gs = adam.glitchseq();
                gs.pause();
                window.octopus = adam.octopus();
            },
            args: ["{that}"]
        },
        noteOn: function (msg) {
            if (msg.note >= 35 && msg.note <= 100){
                // bad start
                octopus.set("f1.freq", flock.midiFreq(msg.note));        
                octopus.set("f1.mul", 1);
            }
        },
        noteOff: function (msg) {
                octopus.set("f1.mul", 0);
        },
        control: {
            func: function (that, msg) {
            if(msg.number=== 85 && msg.value === 127){
                console.log(gs.isPlaying());
                var mymessage = {type: "control", channel: 0, number: 85, value: 1};
                if( gs.isPlaying() ){
                    gs.pause();

                    // need a better way to send light messages
                    that.send(mymessage);
                }else{
                    gs.play();

                    mymessage.value = 127;
                    that.send(mymessage);
                }
            }
            // the knobs
            if(msg.number >  70 && msg.number < 79) {
                var knob = msg.number - 70;
                that.writeLCDRegion(that.options.model["knob" + knob], 8, 0, knob);
                gs.setProb(that.options.model["knob" + knob]  / 100, 0);
            }
            },
            args: ["{that}", "{arguments}.0"]
        },
        pitchbend : function (msg){
        }
    },
    invokers: {},
    modelListeners: {}
});


fluid.defaults("adam.midi.seaboard.july2019", {
    gradeNames: ["adam.midi.seaboard", "adam.midi.domlog", ],
    listeners:{ 
        noteOn: function (msg) {
        },
        noteOff: function (msg) {
        },
        control: function (msg) {
        }
    }
});



fluid.defaults("adam.midi.quneo.july2018", {
    //gradeNames: ["adam.midi.quneo", "adam.midi.console", "adam.midi.domlog"],
    gradeNames: ["adam.midi.quneo", "adam.midi.domlog"],
    listeners:{ 
        noteOn: function (msg) {
            /*if (msg.note >= 68 && msg.note <= 83){
                octopus.set("bop.freq.add", flock.midiFreq(msg.note));        
                octopus.set("bop.mul.gate", 1);
            }
            */
        },
        noteOff: function (msg) {
        },
        control: function (msg) {
            if(msg.number <  10) {
                octopus.set("f"+(msg.number+1)+".mul", msg.value/ 127);
            }
        }
    }
});

fluid.defaults("adam.midi.bcr2000.january2018", {
    gradeNames: ["adam.midi.bcr2000", "adam.midi.domlog"],
    listeners: {
        control: function (msg) {
            if(msg.number ===81){
                octopus.set("f1.mul", msg.value / 127);
            }
            if(msg.number ===82){
                octopus.set("f2.mul", msg.value / 127);
            }
            if(msg.number ===83){
                octopus.set("f3.mul", msg.value / 127);
            }
            if(msg.number ===84){
                octopus.set("f4.mul", msg.value / 127);
            }
            if(msg.number ===85){
                octopus.set("f5.mul", msg.value / 127);
            }
            if(msg.number ===86){
                octopus.set("f6.mul", msg.value / 127);
            }
            if(msg.number ===87){
                octopus.set("f7.mul", msg.value / 127);
            }
            if(msg.number ===88){
                octopus.set("f8.mul", msg.value / 127);
            }
            if(msg.number === 89){
                octopus.scatter();
            }
            if(msg.number === 90){
                octopus.scatterratio(300,1.06,30);
            }
            if(msg.number === 91){
                octopus.scatterratio(305,1.06* 1.06,30);
            }
            if(msg.number === 92){
                octopus.scatterratio(299,1.04,30);
            }
        }
    }
});


/////////////////////////////////////////////
//  Performance Mappings
/////////////////////////////////////////////

function august2019(){
    if(window !== undefined){
        // load synths
        //window.gs = adam.glitchseq();
        fluid.defaults("adam.gseq",{
            gradeNames: ["adam.glitchseq"],
            listeners: {
                beat: function(beat){console.log(beat)
                    if (beat === 0){
                        
                    }
                }
            }
        });

        window.gs = adam.gseq();
        gs.pause();
        //window.octopus = adam.octopus();

        //window.quadsynth = adam.synth.quadvoicepanning();
        // quadsynth.changenotes(38)
        // quadsynth.changenotes(40)

        window.sample1 = adam.sampler.simple({bufferUrl: "glitchseq/beat1.wav"});
        window.sample2 = adam.sampler.simple({bufferUrl: "glitchseq/beat2.wav"});
        window.sample3 = adam.sampler.simple({bufferUrl: "glitchseq/beat3.wav"});
        window.sample4 = adam.sampler.simple({bufferUrl: "glitchseq/beat4.wav"});
        window.sample5 = adam.sampler.simple({bufferUrl: "glitchseq/beat5.wav"});
        window.sample6 = adam.sampler.simple({bufferUrl: "glitchseq/beat6.wav"});
        window.sample7 = adam.sampler.simple({bufferUrl: "glitchseq/beat7.wav"});
        window.sample8 = adam.sampler.simple({bufferUrl: "glitchseq/beat8.wav"});

        //window.pedalkick= adam.sampler.simple({bufferUrl: "glitchseq/beat8.wav"});
        window.kicksnap = adam.sampler.simple({bufferUrl: "snd/kicksnap2.wav"});
        window.filtersnare = adam.sampler.simple({bufferUrl: "snd/filtersnare.wav"});
        window.noisegong = adam.sampler.simple({bufferUrl: "snd/noisegong.wav"});

        // load midi controller mapping
        window.abletonpush  = adam.midi.push.august2019(); 
    }
}

function july2019(){
    if(window !== undefined){
        window.abletonpush  = adam.midi.push.july2019(); // load controller mapping
        window.seaboard  = adam.midi.seaboard.july2019(); // load controller mapping
        //window.sc = adam.stereoclick();
        //window.dv = adam.dustyverb();
        //window.qc = adam.quadclick();
        //qc.pause();
        //sc.pause();
        //dv.pause();
    }
}



fluid.defaults("adam.quadclick", {
    gradeNames: "flock.synth",
    invokers: {
        /*
        split: {
            funcName: "adam.quadclick.split",
            args: ["{that}"]
        },
        slide: {
            funcName: "adam.quadclick.slide",
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        },
        */
        splitsimple: {
            func: "{that}.set",
            args: ["a.source.phase", 0.5]
        }
    },
    synthDef: [
    {
        id: "a",
        ugen: "flock.ugen.distortion.deJonge",
        amount: 150,
        /*
        freq: {
            ugen: "flock.ugen.sinOsc",
            freq: 0.2,
            add: 5000,
            mul: 1200,
        },
        */
        source: {
            ugen: "flock.ugen.impulse",
            freq: 1,
        }
    },
    {
        id: "s",
        ugen: "flock.ugen.filter.biquad.lp",
        freq: {
            ugen: "flock.ugen.sinOsc",
            add: 4000,
            mul: 1000,
            freq: 0.25
        },
        source: {
            ugen: "flock.ugen.impulse",
            freq: 1,
        }
    },       {
        id: "d",
        ugen: "flock.ugen.distortion.deJonge",
        amount: 100,
        /*
        freq: {
            ugen: "flock.ugen.sinOsc",
            freq: 0.2,
            add: 5000,
            mul: 1200,
        },
        */
        source: {
            ugen: "flock.ugen.impulse",
            freq: 1,
        }
    },
        {
            id: "f",
            ugen: "flock.ugen.filter.biquad.lp",
            freq: {
                ugen: "flock.ugen.sinOsc",
                add: 4000,
                mul: 1000,
                freq: 0.25
            },
            source: {
                ugen: "flock.ugen.impulse",
                freq: 1,
            }
        }
    ]
});




fluid.defaults("adam.sampler.fourdrone", {
    gradeNames: ["flock.synth"],
    synthDef:[
    {
        ugen: "flock.ugen.playBuffer",
        id: "sample1",
        buffer:{
            url: "samples/newdrone.wav"
        },
        start: 0,
        loop: 0,
        trigger:{
            ugen: "flock.ugen.valueChangeTrigger",
            source: 0
        },
        mul: {
            ugen: "flock.ugen.squareOsc", 
            freq: 3,
            mul: 0.5, 
            add: 0.5
        }
    },
    {
        ugen: "flock.ugen.playBuffer",
        id: "sample2",
        buffer:{
            url: "samples/newdrone.wav"
        },
        start: 0,
        loop: 0,
        trigger:{
            ugen: "flock.ugen.valueChangeTrigger",
            source: 0
        },
        mul: {
            ugen: "flock.ugen.squareOsc",
            freq: 4, 
            mul: 0.5, 
            add: 0.5
        }
    },
    {
        ugen: "flock.ugen.playBuffer",
        id: "sample3",
        buffer:{
            url: "samples/newdrone.wav"
        },
        start: 0,
        loop: 0,
        trigger:{
            ugen: "flock.ugen.valueChangeTrigger",
            source: 0
        },
        mul: {
            ugen: "flock.ugen.squareOsc",
            freq: 5,
            mul: 0.5, 
            add: 0.5
        }
    },
    {
        ugen: "flock.ugen.playBuffer",
        id: "sample4",
        buffer:{
            url: "samples/newdrone.wav"
        },
        start: 0,
        loop: 0,
        trigger:{
            ugen: "flock.ugen.valueChangeTrigger",
            source: 0
        },
        mul: {
            ugen: "flock.ugen.squareOsc",
            freq: 6,
            mul: 0.5,
            add: 0.5
        }
    }
    ]
});

function june2019(){
	// prevent the contextual menu on right click-
	document.body.oncontextmenu = function(){return false;};
	var livetouches = {}; // put all touches in here

        var oscPort = new osc.WebSocketPort({
            url: "ws://localhost:8080", 
            metadata: true
        });
        oscPort.open();

        oscPort.on("bundle", function(bundle){
            for (var i = 0; i < bundle.packets.length; i++){
                TUIOmessagesToObject( bundle.packets[i] ); 
                TUIOaliveToObject( bundle.packets[i] );
            }
            arraytomapping( livetouches );
            //touchArraytoDOM( livetouches );
        });

        oscPort.on("message", function(msg){
            TUIOmessagesToObject( msg ); 
            TUIOaliveToObject( msg );
            arraytomapping( livetouches );
            //touchArraytoDOM( livetouches );
        });

        function touchArraytoDOM(touches){
            var oscnode = document.getElementById("osctarget");
            // clear divs, not the cleanest way to do this...
            while (oscnode.lastChild) {
                  oscnode.removeChild(oscnode.lastChild);
            };
            Object.keys(touches).forEach(function(key, i){
                var newaddress = document.createElement("div");
                newaddress.id = key;
                newaddress.innerHTML= fluid.prettyPrintJSON(touches[key]);
                oscnode.appendChild(newaddress);
            }); 
        };

        function arraytomapping(touches){
            if ( basssynthplaying ){ 
                Object.keys(touches).forEach(function(key, i){
                    basssynth.set("thing.freq", touches[key][0]*10 + 0.01);
                    basssynth.set("thing.mul", touches[key][1]);
                    basssynth.set("mod.add", touches[key][1]*10 + 90);
                    mintsynth.set("thing" + (i+1) + ".mul", 0);
                });
                return;
            };

            if( gransynthplaying ){
                Object.keys(touches).forEach(function(key, i){
                    gransynth.set("granny.numGrains", touches[key][0]*50 );
                    gransynth.set("granny.grainDur", touches[key][1] + 0.01);
                    mintsynth.set("thing" + (i+1) + ".mul", 0);
                    //console.log(touches[key]);
                });
                return; 
            };

            Object.keys(touches).forEach(function(key, i){
                // range of 0.01 to 0.2 is pretty great
                if (i === 0){
                    mintsynth.set("granny.grainDur", touches[key][0] / 5 + 0.01);
                }
                mintsynth.set("thing" + (i+1) + ".freq", touches[key][1] * 300 + 1);
                mintsynth.set("thing" + (i+1) + ".mul", 0.4);
            });
            if (Object.keys(touches).length < 5){
                for (var j = Object.keys(touches).length; j < 5; j++){
                    if (j < 5){
                        mintsynth.set("thing" + (j+1) + ".mul", 0);
                    }
                };
            }
        };

        function TUIOmessagesToObject(packet){
            if (packet.address === "/tuio/2Dcur"){
                if (packet.args[0].value === "set"){
                    livetouches[ packet.args[1].value ] = [ packet.args[2].value, packet.args[3].value ];
                }
            }
        };
        
        function TUIOaliveToObject(packet){
            if (packet.address === "/tuio/2Dcur"){
                if(packet.args[0].value === "alive"){
                    var packetargs = packet.args;
                    packetargs.shift(); // remove first element which is the alive message
                    // if no touches are active then clear the toucharray
                    if(packetargs.length === 0){
                        livetouches = {};
                        return;
                    }
                    // search all keys for current session id, if not found then delete it
                    Object.keys(livetouches).forEach(function(key, i){
                        for (var j = 0; j < packetargs.length; j++){
                            if( parseInt(key)  === packetargs[j].value ){
                                return;
                            }
                        } 
                        delete livetouches[key];
                    });
                }
            } 
        };


        var gransynthplaying = false;
            var basssynthplaying = false;

            //https://stackoverflow.com/questions/36011249/detect-hold-mouse-click-in-javascript
            window.addEventListener('mousedown', function(e) {
                //console.log(e.button);
                mouseIsDown = true;
                if (e.button === 2){
                    setTimeout(function() {
                        if(mouseIsDown) {
                            // mouse was held down for > 2 seconds
                            if(basssynthplaying){
                                basssynth.noteOff();
                            }else{
                                basssynth.noteOn();
                            }
                            basssynthplaying = !basssynthplaying;
                        }
                    }, 2000);
                }else{
                    setTimeout(function() {
                        if(mouseIsDown) {
                            // mouse was held down for > 2 seconds
                            if(gransynthplaying){
                                gransynth.noteOff();
                            }else{
                                gransynth.noteOn();
                            }
                            gransynthplaying = !gransynthplaying;
                        }
                    }, 2000);
                }
            });



    
            window.addEventListener('mouseup', function() {
                  mouseIsDown = false;
            });

            // nice implementation to add an event after scrolling stops
            // https://stackoverflow.com/a/37951069/1945902
            var _scrollTimeout = null;
            var wheeldata = [0,0,0];

            function wheeldataaccumulator(x,y,z){
                wheeldata[0] += x;
                wheeldata[1] += y;
                wheeldata[2] += z;

                wheeldata[0] = Math.min( 1000, Math.max(wheeldata[0], 0)); 
                wheeldata[1] = Math.min( 1000, Math.max(wheeldata[1], 0)); 
                wheeldata[2] = Math.min( 1000, Math.max(wheeldata[2], 0)); 


                gransynth.set ("granny.delayDur", wheeldata[0]/100 + 0.4);
                gransynth.set ("granny.source.end", wheeldata[1]/1100 + 0.1);
            };

            window.addEventListener('wheel', function(e){
                var wheelnode = document.getElementById("wheeltarget");
                //wheeldata = [e.deltaX, e.deltaY, e.deltaZ]
                wheeldataaccumulator(e.deltaX, e.deltaY, e.deltaZ);
                wheelnode.innerHTML = fluid.prettyPrintJSON( wheeldata );

                clearTimeout(_scrollTimeout);
                _scrollTimeout = setTimeout(function() {
                    wheelnode.innerHTML = '';
                }, 250);
            });

    var mintsynth = flock.synth({
        synthDef:{
            ugen: "flock.ugen.scope",
            source: {
                ugen: "flock.ugen.freeverb",
                mix: 1, 
                damp: 0.7,
                room: 0.9,
                mul: 5,
                source: {
                    ugen: "flock.ugen.granulator",
                    id: "granny",
                    numGrains: 20,
                    grainDur: 0.01,
                    delay: 8,
                    source: {
                        ugen: "flock.ugen.sum",
                        sources:[
                        {
                            id: "thing1",
                            ugen: "flock.ugen.saw", 
                            freq: 300,
                            mul: 0
                        },
                        {
                            id: "thing2",
                            ugen: "flock.ugen.saw", 
                            freq: 300,
                            mul: 0.0
                        },
                        {
                            id: "thing3",
                            ugen: "flock.ugen.saw", 
                            freq: 300,
                            mul: 0.0
                        },
                        {
                            id: "thing4",
                            ugen: "flock.ugen.saw", 
                            freq: 300,
                            mul: 0.0
                        },
                        {
                            id: "thing5",
                            ugen: "flock.ugen.saw", 
                            freq: 300,
                            mul: 0.0
                        }
                        ],
                    }
                }
            } ,
            options: {
                canvas: "#meter",
                styles: {
                    strokeColor: "#777777",
                    strokeWidth: 2
                }
            }
        } 
    });

    var basssynth = flock.synth({
        synthDef: {
            ugen: "flock.ugen.distortion.tarrabiaDeJong",
            mul: {
                ugen: "flock.ugen.asr",
                attack: 10,
                release: 5,
                id: "env",
                gate: 0,
                mul: 0.35
            },
            amount: {
                ugen: "flock.ugen.sin",
                rate: "control",
                id: "thing",
                mul: 1,
                freq: 0.1 /// change this value!

            },
            source: {
                ugen: "flock.ugen.saw",
                freq: {
                    id: "mod",
                    ugen: "flock.ugen.square",
                    mul: {
                        ugen: "flock.ugen.sin",
                        mul: 30,
                        freq: 2
                    },
                    add: 100
                }
            }
        }
    });

    var gransynth = flock.synth({
        synthDef: {
            ugen: "flock.ugen.granulator",
            id: "granny",
            /*numGrains: {
             * ugen: "flock.ugen.line",
             * start: 1,
             * end: 50,
             * duration: 90
             * },
             * grainDur: {
             * ugen: "flock.ugen.line",
             * start: 0.1,
             * end: 0.005,
             * duration: 100 *
             * },*/ 
            delayDur: 4,
            mul: {
                ugen: "flock.ugen.asr",
                id: "env",
                release: 5,
                gate: 0,
            },
            source: {
                ugen: "flock.ugen.playBuffer",
                buffer: {
                    id: "chord",
                    url: "snd/C9drone.wav"
                },
                loop: 1,
                mul: 2,
                start: 0,

                end: 0.1
            }
        }
    });
};
