(function iFramePopup(options){

    var TM = {
        debug:true
        ,debugDetail:5
        ,log:function(msg,lvl){lvl=lvl||5;if (TM.debug && window["console"] && lvl<=TM.debugDetail){console.log(msg);}}
        /**
         * NB: source & target now revered order
         * TODO: will need to retro fix other functions calling this
         */
        ,extend:function (target /*,[source],[source]*/ ){
            //if(!target){target = this;}
            var sources = TM.ARRAY.fromCollection(arguments).slice(1);
            for(var index in sources){
                var source = sources[index];
                for(var propName in source){
                    if(source.hasOwnProperty(propName)){
                        try{
                            TM.log("applying prop["+propName+"]");
                            if(typeof(source[propName]) == 'object'){
                                if(target[propName] == undefined){target[propName]={};}
                                TM.log("recurse into " + propName);
                                TM.extend(target[propName], source[propName]);
                            }else{
                                try{target[propName] = source[propName];}catch(exc){TM.log("error:" + exc.message);}
                            }
                        }catch(ex){
                            // ignore errors, uncomment for debugging
                            TM.log("error extending object: " + ex.message);
                        }
                    }
                }
            }
            return target;
        }
        ,DOM:{
            getElement:function(el){
                return (typeof el === "string")?document.getElementById(el):el;
            }
            ,createElement:function(tagname,attribs,p){
                var el = document.createElement(tagname);
                if (attribs){TM.extend(el, attribs);}
                if (p) {
                    p = TM.DOM.getElement(p);
                    p.appendChild(el);
                }
                return el;
            }
            ,remove: function(el) {
                var el = TM.DOM.getElement(el);
                el.parentNode.removeChild(el);
            }
            /**
             * add event handlers to elements
             * TM.DOM.addEvent(element,eventType,callbackFunction)
             * TM.DOM.addEvent([elements],eventType,callbackFunction)
             */
            ,addEvent:(function( window, document ) {
                if ( document.addEventListener ) {
                    return function( elem, type, cb ) {
                        if ( (elem && !elem.length) || elem === window ) {
                            elem.addEventListener(type, cb, false );
                        }
                        else if ( elem && elem.length ) {
                            var len = elem.length;
                            for ( var i = 0; i < len; i++ ) {
                                TM.DOM.addEvent( elem[i], type, cb );
                            }
                        }
                    };
                }
                else if ( document.attachEvent ) {
                    return function ( elem, type, cb ) {
                        if ( (elem && !elem.length) || elem === window ) {
                            elem.attachEvent( 'on' + type, function() { return cb.call(elem, window.event) } );
                        }
                        else if ( elem.length ) {
                            var len = elem.length;
                            for ( var i = 0; i < len; i++ ) {
                                TM.DOM.addEvent( elem[i], type, cb );
                            }
                        }
                    };
                }
            })( this, document )
            /**
             * John Resigs 2005 event handler function
             * can probably be improved
             */
            ,removeEvent:function removeEvent( obj, type, fn ) {
                if ( obj.detachEvent ) {
                    obj.detachEvent( 'on'+type, obj[type+fn] );
                    obj[type+fn] = null;
                } else {
                    obj.removeEventListener( type, fn, false );
                }
            }
        }
        ,ARRAY:{
            fromCollection:function(collectionObj){
                try{
                    // IE8 has broken this...!
                    return Array().slice.call(collectionObj);
                }catch(ex){
                    //so we need this
                    var arr = [];
                    for(var i = 0; i < collectionObj.length ; i++){
                        arr.push(collectionObj[i]);
                    }
                    return arr;
                }
            }
        }
    };

    var defaultSettings = {
        pageUrl:null
//        ,mask:{
//            id:"modalMask"
//            ,style:{
//                position:'absolute'
//                ,top:'0px'
//                ,left:'0px'
//                ,height:'100%'
//                ,width:'100%'
////                ,backgroundColor:"rgba(227,244,195,0.9)"
//                ,backgroundColor:"rgba(227,227,227,0.9)"
////                ,opacity:'0.5'
//                ,zIndex:'1000'
//            }
//        }
        ,sidebar:{
            id:"sidebar"
            ,style:{
                position:'fixed'
//                position:'absolute'
                ,top:'1px'
                ,right:'1px'
                ,height:'99%'
                ,width:'300px'
                ,backgroundColor:'white'
                ,border:"3px solid rgba(65, 95, 159, 0.7)"
                ,borderRadius:"5px 0px 0px 5px"
                ,borderRight:"none"
                ,zIndex:'10001'
            }
        }
        ,tab:{
            id:"tab"
            ,style:{
                position:'absolute'
                ,display:"block"
                ,top:'50%'
                ,left:'-28px'
//                ,height:'100px'
                ,lineHeight:'100px'
                ,width:'25px'
                ,backgroundColor:'#415f9f'
                ,border:"3px solid rgba(65, 95, 159, 0.7)"
                ,borderRadius:"5px 0px 0px 5px"
                ,borderRight:"none"
                ,fontSize:"2em"
                ,fontWeight:"bolder"
                ,color:"white"
                ,zIndex:'10001'
                ,overflow:'hidden'
                ,textDecoration:'none'
            }
            ,innerHTML:'>'
        }
        ,nav:{
            id:"modalNavigation"
            ,style:{
                display:'block'
                ,width:'100%'
                ,padding:"5px 8px"
                ,backgroundColor:'#BBC5DC'
                ,color:'white'
                ,fontSize:'16px'
                ,font:"Helvetica Neue,Helvetica,Arial,sans-serif"
                ,fontWeight:"bolder"

            }
            ,innerHTML:'Commentree'
        }
        ,closeButton:{
            id:"modalClose"
            ,style:{
                position:'absolute'
                ,right:'0.1em'
                ,top:'0.1em'
                ,width:"1em"
                ,lineHeight:"1em"
                ,backgroundColor:'black'
                ,color:"white"
                ,border:'3px solid white'
                ,borderRadius:'5px'
                ,boxShadow:"2px 2px 4px 0px black"
                ,padding:'1px'
                ,cursor:"pointer"
//                ,fontSize:'1em'
                ,fontWeight:"bolder"
                ,textAlign:"center"
            }
            ,innerHTML:'x'
        }
        ,mainContent:{
            id:'modalContent'
            ,style:{
                position:"absolute"
                ,marginTop:"30px"
                ,top:"0px"
                ,bottom:"0px"
                ,left:"0px"
                ,right:"0px"
                ,backgroundColor:'yellow'
                ,backgroundImage:'url(https://app.commentree.com/enyo/lib/onyx/images/spinner-light.gif)'
                ,backgroundPosition:'center center'
                ,backgroundRepeat:'no-repeat'
            }
            ,innerHTML:'content here'
        }
        ,callback:function(){}
    };
    var settings = TM.extend(defaultSettings, options);

    scroll(0,0);

//    var mask = TM.DOM.createElement("div",settings.mask,document.body);
    var sidebar = TM.DOM.createElement("div",settings.sidebar,document.body);
    var tab = TM.DOM.createElement("a",settings.tab,sidebar);
    var nav = TM.DOM.createElement("div",settings.nav,sidebar);
    var closeButton = TM.DOM.createElement("a",settings.closeButton,nav);
    var content = TM.DOM.createElement("div",settings.mainContent,sidebar);

    function cancelScroll(){
        scroll(0,0);return false;
    }

    function close(){
        TM.DOM.remove(content);
        TM.DOM.remove(closeButton);
        TM.DOM.remove(nav);
        TM.DOM.remove(sidebar);
//        TM.DOM.remove(mask);
        TM.DOM.removeEvent(window,"scroll",cancelScroll);
    }

    var sidebarClosed = false;

    function tabClicked(){
        // init css animation transition
        sidebar.style.right = sidebarClosed?"0px":"-300px";
        //change tab icon
        tab.innerHTML = sidebarClosed?"&gt;":"&lt;";
        // reverse state
        sidebarClosed = !sidebarClosed;
    }

//    TM.DOM.addEvent(mask,"click",close);
    TM.DOM.addEvent(closeButton,"click",close);
    TM.DOM.addEvent(tab,"click",tabClicked);
//    TM.DOM.addEvent(window,"scroll",cancelScroll);

    // handle close - attach to mask click & closeButton
    // stop window scroll white active
    // make sure correct size on mobile

    // callback signal that building is finished
    // can be used to post process
    settings.callback();

    // why is this being wierd
})({mainContent:{
    innerHTML:'<iframe src="https://app.commentree.com/" style="width:100%;height:100%;border:none;"></iframe>'
}});


//javascript:if(!window['ScreenShot']){(function(src){var%20d=document;var%20s=d.createElement('script');s.type='text/javascript';s.src=src;d.body.appendChild(s);})('//www.commenttree.com/js/plugins/launch.js');}