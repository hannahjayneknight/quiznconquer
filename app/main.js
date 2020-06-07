import ui from "./uiNuttyTilez.js";
const el = (id) => document.getElementById(id);

window.addEventListener("DOMContentLoaded", function () {
    ui.init();
    /*
    const timer = function () {
        var start= Date.now();
        r=document.getElementById("timer");
        (function f () {
        var diff=Date.now()-start,ns=(((3e5-diff)/1e3)>>0),m=(ns/60)>>0,s=ns-m*60;
        r.textContent="Registration closes in "+m+':'+((''+s).length>1?'':'0')+s;
        if(diff>3e5){
           start=Date.now()
        }
        setTimeout(f,1e3);
        })();
  }
  */
});
