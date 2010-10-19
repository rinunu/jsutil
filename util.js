// -*- coding: utf-8 -*-

var util = {};

/**
 * sub のプロトタイプチェーンに super_.prototype を入れる。
 * 
 * また、 sub の prototype に super_ を設定する。
 * これにより sub の生成したオブジェクトは
 * this.super_.superMethod の形で、 super_ のメソッドにアクセス出来る。
 */
util.extend = function(sub, super_){
    function f(){};
    f.prototype = super_.prototype;
    sub.prototype = new f();
    sub.prototype.constructor = sub;
    sub.prototype.super_ = super_.prototype;
};

util.bind = function(this_, method){
    console.assert(this_);
    console.assert(typeof(method) == "function");
    var args = Array.prototype.slice.call(arguments, 2);
    return function(){
	var args2 = Array.prototype.slice.call(arguments);
	return method.apply(this_, args.concat(args2));
    };
};

/**
 * a, b 二つの関数を順番に呼び出す関数を返す
 */
util.concat = function(a, b){
    return function(){
	a.apply(this, arguments);
	b.apply(this, arguments);
    };
};

util.setCaretPosition = function(textarea, pos){
    if(textarea[0].setSelectionRange){
	textarea[0].setSelectionRange(pos, pos);
    }
};

