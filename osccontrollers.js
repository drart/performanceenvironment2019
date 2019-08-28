(function(){

    fluid.defaults("adam.oscreceiver", {
        gradeNames: "fluid.component",
        oscPort: null,
        listeners: {
            onCreate: {
                func: function(that){
                    that.options.oscPort.open();
                    console.log(that.options.oscPort);
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
        gradeNames: "adam.oscreceiver", 
        livetouches: [],
        events: {
            touchdown: null,
            touchreleased: null,
            touchemoved: null
        },
        listeners: {
            message: {
                funcName: "tuioparser",
                args: ["{that}", "{arguments}.0"]
            },
            bundle: {
                func: function(that, bundle){
                    for (var i = 0; i < bundle.packets.length; i++){
                        tuioparse(that, bundle.packets[i]);        
                    }
                },
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    tuioparser = function(that, packet){
        console.log("got here");
        if (packet.address === "/tuio/2Dcur"){
            if (packet.args[0].value === "set"){
                that.options.livetouches[ packet.args[1].value ] = [ packet.args[2].value, packet.args[3].value ];

                if(livetouches[key] !== undefined){
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
                Object.keys(livetouches).forEach(function(key, i){
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
        gradeNames: ["adam.connector.websocket"],
        port: 8080,
        host: "localhost",
        listeners: {
            message: console.log,
            bundle: console.log,
        }
    });
})();
