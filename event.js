util = util || {};

/**
 * ユーザイベントを処理する
 *
 * - イベントソースとイベントハンドラーの紐付けの管理
 * - イベントのトリガー
 */
util.Event = {};
util.Event.nextId = 1;

/**
 * {sourceのid : [{object, methods}]}
 */
util.Event.handlerMap = {};

/**
 * source のイベントを監視するハンドラーを追加する
 * 
 * object は監視するハンドラーメソッドを持つオブジェクト。
 * methods は eventType とハンドラーメソッドの連想配列。
 * eventType のイベントが発生した際に、当該ハンドラーメソッドが呼び出される。
 * ハンドラーメソッドの形式は次の通り。
 * function(source, eventType, <その他、triggerに渡された引数>) 
 */
util.Event.bind = function(source, object, methods){
    console.assert(source);
    console.assert(object);
    console.assert(methods);

    var id = this.getId(source);
    this.handlerMap[id] = this.handlerMap[id] || [];

    this.handlerMap[id].push({object:object, methods:methods});
};

/**
 * 対象 object を source のハンドラーリストから削除する
 * source を指定しなかった場合、すべてのハンドラーリストから削除する
 */
util.Event.unbind = function(object, source){
    var sourceId = source ? this.getId(source) : null;
    console.assert(object);
    var unbound = [];
    for(var i in this.handlerMap){
	if(sourceId && sourceId != i){
	    continue;
	}
	var handlers = this.handlerMap[i];
	for(var j = 0; j < handlers.length; ++j){
	    var handler = handlers[j];
	    if(handler.object == object){
		handlers.splice(j, 1);
		unbound.push(handler);
		break;
	    }
	}
    }
    console.log("unbind", unbound);
};

/**
 * source の eventType イベントをハンドラーに通知する
 * 
 * このメソッドに渡された引数は、すべてハンドラーに渡される。
 */
util.Event.trigger = function(source, eventType){
    var handlers = this.handlerMap[this.getId(source)];
    if(!handlers){
	return;
    }
    
    // イベント処理の途中で handlers が変更される場合を考慮し、コピー
    handlers = handlers.slice(0);
    for(var i = 0; i < handlers.length; i++){
        var handler = handlers[i];
	var method = handler.methods[eventType];
	if(method){
	    method.apply(handler.object, arguments);
	}
    }
};

// ----------------------------------------------------------------------
// private

/**
 * source を識別する ID を取得する
 */
util.Event.getId = function(source){
    console.assert(source);
    if(!source.eventId){
	source.eventId = this.nextId++;
    }
    return source.eventId;
};
