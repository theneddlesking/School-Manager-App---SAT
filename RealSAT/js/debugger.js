//togglable console.log

var Debugger = {
        on : false,

        onForScripts : [
                "columnModule"
        ],

        log : function(message, script) {
                if (this.on || this.onForScripts.includes(script)) {
                      console.log(message);
                }
        }
}

Debugger.on = false;
