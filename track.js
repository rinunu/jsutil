var mabi = mabi || {};

/**
 * イベントのトラックを行う
 */
mabi.Track = function(){
};

mabi.Track.setVar = function(value){
    _gaq.push(['_setVar', value]);
};

/**
 * Ajax による画面遷移
 */
mabi.Track.transit = function(url){
    _gaq.push(['_trackPageview', "/" + url]);
};

/**
 * その他のイベント
 * 
 */
mabi.Track.track = function(category, action, label){
    console.debug("track", category, action, label);
    _gaq.push(['_trackEvent', category, action, label]);
};
