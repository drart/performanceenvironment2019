fluid.defaults('adam.enveloper', {
    gradeNames: 'flock.synth',
    synthDef: {
        id: "env",
        ugen: "flock.ugen.envGen",
        rate: "control",
        mul: 1,
        //envelope: {},
    },
    loop: false,
    looptimer : null,
    invokers: {
        range: {
            func: function(that, low, high){
                that.set("env.mul", high - low);
                that.set("env.add", low);
            },
            args: ["{that}", "{arguments}.0", "{arguments}.1"] 
        },
        createenv:{
            func: function(that, args){
                let envobj = args;
                if (args instanceof Array){
                   envobj = {};
                   envobj.levels = [];
                   envobj.times= [];
                   envobj.curve= [];
                   for(var i = 0; i <  args.length; i++){
                       envobj.levels[i] = args[i];
                       if (i !== args.length - 1){
                           envobj.times[i] = 1;
                           envobj.curve[i] = "linear";
                       }
                   } 
                };
               console.log(envobj);
                that.set("env.envelope", envobj);
            },
            args: ["{that}", "{arguments}.0"]
        },
        trig: {
            func: function(that){
                var myfunc = function(that){
                    that.set("env.gate", 0);
                    that.set("env.gate", 1);
                };
                if(that.options.loop){
                    var theenv = that.getenvelope();
                    var envduration = 0;
                    for(var i = 0; i < that.getenvelope().times.length; i++){
                        envduration += theenv.times[i];
                    }
                    that.options.looptimer = settimeout(myfunc, envduration);
                }else{
                    myfunc(); 
                }
            },
            args: ["{that}"]
        },
        getsteplevel: {
            func: function(that, step){
                return that.getenvelope().levels[step];
            },
            args: ["{that}", "{arguments}.0"]
        },
        /// the curve between step and the next
        getintervalurve: { 
            func: function(that, step){
                return that.getenvelope().curve[step];
            },
            args: ["{that}", "{arguments}.0"]
        },
        getsteplength: {
            func: function(that){
                return that.get("env.envelope").levels.length;
            },
            args: ["{that}"]
        },
        getenvelope: {
            func: "{that}.get",
            args: ["env.envelope"]
        },
        addstep:{
            func: function(that, level, time, curve){
                var theenv = that.getenvelope();

                theenv.levels.push(level);
                var thetime = (time === undefined)? 1 : time;
                var thecurve = (curve === undefined)? 'linear' : curve;
                theenv.times.push(thetime);
                theenv.curve.push(thecurve);

                that.set("env.envelope", theenv);
            },
            args: ["{that}", "{arguments}.0","{arguments}.1","{arguments}.2"] 
        },
    }
});
