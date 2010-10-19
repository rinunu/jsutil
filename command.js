
/**
 * コマンド(管理すべき処理)を表す
 * 
 * 管理とは以下のような扱いのことを言う
 * - 同時実行を抑制する
 * - 完了を待つ
 * - 失敗時にリトライする
 * 
 * プロパティ
 * - id: コマンドの ID. 指定しない場合は自動で振られる。
 * 同じ ID のコマンドを同時に実行することは出来ない。
 */
util.Command = function(options){
    options = options || {};
    this.manager_ = util.Command;

    this.id_ = options.id || 'cmd' + this.manager_.nextId_++;
};

// ----------------------------------------------------------------------
// Command 使用側インタフェース

util.Command.prototype.id = function(){
    return this.id_;
};

/**
 * 実行可能か
 */
util.Command.prototype.canExecute = function(){
    return true;
};

/**
 * 実行
 */
util.Command.prototype.execute = function(){
    console.log('command start: ' + this.id());
    this.manager_.onExecute(this);
    this.onExecute();
    return this;
};

/**
 * 成功時のコールバックを登録する
 */
util.Command.prototype.success = function(success){
    if(this.success_){
	this.success_ = util.concat(this.success_, success);
    }else{
	this.success_ = success;
    }
};

/**
 * 失敗時のコールバックを登録する
 */
util.Command.prototype.error = function(error){
    if(this.error_){
	this.error_ = util.concat(this.error_, error);
    }else{
	this.error_ = error;
    }
};

// ----------------------------------------------------------------------
// Command 実装側インタフェース

/**
 * 処理を実行する
 * 
 * 成功時は this.onSuccess, 失敗時は this.onError を呼び出すこと
 */
util.Command.prototype.onExecute = function(){
};

/**
 * 処理が正常に完了した場合に呼び出す必要がある
 * 引数はすべて success のリスナに渡される
 */
util.Command.prototype.onSuccess = function(){
    this.manager_.onSuccess(this);
    if(this.success_){
	this.success_.apply(this, arguments);
    }
};

/**
 * 処理が失敗した場合に呼び出す必要がある
 * 引数はすべて success のリスナに渡される
 */
util.Command.prototype.onError = function(){
    this.manager_.onError(this);
    if(this.error_){
	this.error_.apply(this, arguments);
    }
};

// ----------------------------------------------------------------------
// static

util.Command.nextId_ = 1;

/**
 * 実行中の Command
 */
util.Command.commands_ = {};

/**
 * 指定した ID の Command を取得する
 * 
 * 実行中ではない場合は null を返す
 */
util.Command.find = function(id){
    return this.commands_[id];
};

/**
 */
util.Command.onExecute = function(command){
    console.assert(!this.commands_[command.id()]);
    this.commands_[command.id()] = command;
};

/**
 */
util.Command.onSuccess = function(command){
    console.assert(this.commands_[command.id()]);
    delete this.commands_[command.id()];
};

/**
 */
util.Command.onError = function(command){
    console.assert(this.commands_[command.id()]);
    delete this.commands_[command.id()];
};

// ======================================================================
// 

/**
 * 同期実行 Command
 */
util.SyncCommand = function(execute, options){
    this.super_.constructor.call(this, options);
    this.execute_ = execute;
};

util.extend(util.SyncCommand, util.Command);

util.SyncCommand.prototype.onExecute = function(){
    this.execute_();
    this.onSuccess();
};

// ======================================================================

/**
 * 非同期実行 Command
 */
util.AsyncCommand = function(execute, options){
    this.super_.constructor.call(this, options);
    this.onExecute = execute;
};

util.extend(util.AsyncCommand, util.Command);

// ======================================================================
//

/**
 * 複数の Command を同時に実行する Command
 * 
 * すべての Command が完了すると、この Command も完了する
 */
util.ConcurrentCommand = function(commands, options){
    this.super_.constructor.call(this, options);
    var this_ = this;
    this.commands_ = 0;
    $.each(commands, function(i, v){
	       this_.add(v);
	   });
};

util.extend(util.ConcurrentCommand, util.Command);

/**
 * 完了待ちをする Command を追加する
 */
util.ConcurrentCommand.prototype.add = function(command){
    var this_ = this;
    this.commands_++;
    command.success(function(){
			this_.commands_--;
			console.log('command success: ', this_.commands_);
			if(this_.commands_ == 0){
			    this_.onSuccess()
			}
		    });
};

// ======================================================================

/**
 * 指定時間後に execute を実行する Command
 * @param execute 実行する関数。 指定しない場合は何も実行せずに成功する。
 * @param time タイムアウトまでの時間。 指定しない場合は即タイムアウトする。
 */
util.TimerCommand = function(execute, time, options){
    this.super_.constructor.call(this, options);
    this.execute_ = execute;
    this.time_ = time || 1;
};

util.extend(util.TimerCommand, util.Command);

util.TimerCommand.prototype.onExecute = function(){
    var this_ = this;
    setTimeout(function(){
		   if(this_.execute_){
		       this_.execute_();
		   }else{
		       this_.onSuccess();
		   }
	       }, this.time_);
};


