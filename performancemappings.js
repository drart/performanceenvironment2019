/////////////////////////////////////////////
//  Controller Mappings
/////////////////////////////////////////////


fluid.defaults("adam.midi.push.july2019", {
    gradeNames: ["adam.midi.push", "adam.midi.domlog", "adam.midi.console"],
    listeners:{ 
        onReady: {
            func: function (that){
                for(var i = 1; i < 9; i++){
                    that.writeLCDRegion(that.options.model["knob" + i], 8, 0, i);
                }
            },
            args: ["{that}"]
        },
        noteOn: function (msg) {
            if (msg.note >= 35 && msg.note <= 100){
                //octopus.set("bop.freq.add", flock.midiFreq(msg.note));        
                //octopus.set("bop.mul.gate", 1);
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

/*
 * // the future!!!
fluid.defaults("adam.midi.bcr2000", {
    gradeNames: "flock.midi.connection",
    listeners: {
        "noteOn.domoreimportantthing": "{synth}.set(awesome.ugen, 440)",
        "noteOn.logNoteValue" : {
            priority: "after:domoreimportantthing",
        }
    }
});
*/


/////////////////////////////////////////////
//  Performance Mappings
/////////////////////////////////////////////


function july2019(){
    if(window !== undefined){
        window.abletonpush  = adam.midi.push.july2019(); // load controller mapping
        window.seaboard  = adam.midi.seaboard.july2019(); // load controller mapping
        window.gs = adam.glitchseq();
        window.octopus = adam.octopus();
        //window.sc = adam.stereoclick();
        //window.dv = adam.dustyverb();
        //window.qc = adam.quadclick();
        gs.pause();
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


var playdrone = flock.synth({
    synthDef:{
        ugen: "flock.ugen.playBuffer",
        id: "sample",
        buffer:{
            url: "samples/newdrone.wav"
        },
        start: 0,
        loop: 0,
        trigger:{
            ugen: "flock.ugen.valueChangeTrigger",
            source: 0
        }
    }
});

playdrone.myplay = function(){ 
    playdrone.set("sample.trigger.source", 1)
};

playdrone.ripple = function(){
    playdrone.set("sample.mul", {
        ugen: "flock.ugen.squareOsc", 
        add: 0.5,
        mul: 0.5,
        freq: 5
    });
};




var fourdrone = flock.synth({
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


