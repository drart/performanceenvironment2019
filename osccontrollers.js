(function(){

    fluid.defaults("adam.oscreceiver", {
        gradeNames: "fluid.component",
        oscPort: null,
        listeners: {
            onCreate: {
                func: function(that){
                    that.options.oscPort.open();
                    that.options.oscPort.on("message", that.events.message.fire );
                    that.options.oscPort.on("bundle", that.events.bundle.fire );
                },
                args: [ "{that}" ],
                priority: "last"
            },
        },
        events: {
            message: null, 
            bundle: null
        },
    });

    fluid.defaults("adam.connector.websocket", {
        gradeNames: "adam.oscreceiver",
        port: 8080,
        host: "localhost",
        listeners: {
            onCreate: {
                func: function(that){
                    var theurl = "ws://" + that.options.host + ":" + that.options.port
                    that.options.oscPort = new osc.WebSocketPort({
                        url: theurl,
                        metadata: true
                    });
                },
                args: [ "{that}" ],
                priority: "first"
            }
        }
    });

    fluid.defaults("adam.tuioreceiver", {
        gradeNames: "fluid.component",  
        livetouches: [],
        events: {
            touchdown: null,
            touchreleased: null,
            touchemoved: null
        },
        listeners: {
            message: {
                funcName: "adam.tuioparser",
                args: ["{that}", "{arguments}.0"]
            },
            bundle: {
                func: function(that, bundle){
                    for (var i = 0; i < bundle.packets.length; i++){
                        adam.tuioparse(that, bundle.packets[i]);        
                    }
                },
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    adam.tuioparser = function(that, packet){
        console.log("got here");
        if (packet.address === "/tuio/2Dcur"){
            if (packet.args[0].value === "set"){
                that.options.livetouches[ packet.args[1].value ] = [ packet.args[2].value, packet.args[3].value ];

                if(that.optionslivetouches[key] !== undefined){
                    that.events.touchmoved.fire( key, that.options.livetouches[key] );
                }else{
                    that.events.touchdown.fire( key, that.options.livetouches[key] );
                }
                
                return;
            }
            if(packet.args[0].value === "alive"){
                var packetargs = packet.args;
                packetargs.shift(); // remove first element which is the alive message
                // if no touches are active then clear the toucharray
                if(packetargs.length === 0){
                    that.options.livetouches = {};
                    return;
                }
                // search all keys for current session id, if not found then delete it
                Object.keys(that.optionslivetouches).forEach(function(key, i){
                    for (var j = 0; j < packetargs.length; j++){
                        if( parseInt(key)  === packetargs[j].value ){
                            return;
                        }
                    } 
                    that.events.touchreleased.fire(key);
                    delete that.options.livetouches[key];
                });
            }
        }
    };

    fluid.defaults("adam.soundplane", {
        //gradeNames: ["adam.connector.websocket"],
        // BROKEN :(
        gradeNames: ["adam.connector.websocket", "adam.tuioreceiver"],
        port: 8080,
        host: "localhost",
        listeners: {
            message: console.log,
            bundle: console.log,
            touchdown: console.log
        }
    });

    fluid.defaults("adam.osc.tuiotodom", {
        gradeNames: "fluid.component",
        listeners: {
            // somemessage 
            // func 
        }
    });

    adam.arraytodom = function(touches){
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

    adam.soundplaneaugust2019 = function (touches){
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

})();
