var MyScroll = function(config){
	var that = this;
	//默认配置项
	defaultConfig = {
		"color":"rgb(10, 116, 218)",//进度条颜色
		"debounce":50,//节流时间ms
		"height":"3px",//进度条高度
		"debug":false,//调试模式
		"type":'up-down',//up-down从上往下滑触发 down-up从下往上滑触发 all都能触发
		"event":[]
	};
	//event数组对象
	// {
	// 	"loop":false,//是否循环 true一直触发false触发一次
	// 	"height":"100%",//触发高度支持px和百分比
	// 	"type":"all",//同上，不过此优先级高
	// 	"func":function(){
	// 		console.log('到底了');
	// 	}//方法
	// }
	//合并配置项
	var mergeConfig = this.config = this.extend(config, defaultConfig);
	//事件
	var event =this.event = mergeConfig.event;
	//渲染dom
	this.loadBar();
	this.preHeight = this.getScrollTop();
	this.nextHeight = this.getScrollTop();
	//监听
	var t;
	window.onscroll=function(){
	    // 窗口可视范围的高度
	    var height=that.getClientHeight(),
	        // 窗口滚动条高度
	        theight=that.getScrollTop(),
	        // 窗口可视范围的高度
	        rheight=that.getScrollHeight(),
	        // 滚动条距离底部的高度
	        bheight=rheight-theight-height;
	        var per = (theight/(theight+bheight)).toFixed(4)*100+'%';
	        document.getElementById('progressBar').style.width = per;
	        if(that.config.debug){
	        	document.getElementById('debugShow').innerHTML='此时浏览器可见区域高度为：'+height+'<br />此时文档内容实际高度为：'+rheight+'<br />此时滚动条距离顶部的高度为：'+theight+'<br />此时滚动条距离底部的高度为：'+bheight;
	        }
	        //去抖
	        if(t) clearTimeout(t);
	        t = setTimeout(function(){
	        	that.preHeight = that.nextHeight;
	        	that.nextHeight = theight;
	            that.checkEvent();
	        },that.config.debounce);
	}
}

/**以下为公共方法**/
//extend方法，与$.extend()相同
MyScroll.prototype.extend = function (p1, p2){
		var p = (function loop(p1, p2){
			var p = {};//返回值
			for(var item in p2){
				//如果是对象再次递归调用函数
				if(typeof p2[item]==='object' && p2[item].__proto__!=Array.prototype){
					p[item] = loop(p1[item], p2[item]);
				}else{
					/**自定义配置项覆盖默认配置**/
					if((typeof p1)!='undefined' && (typeof p1[item])!='undefined' && p1[item]){
						p[item] = p1[item];
					}else{
						p[item] = p2[item];										
					}
				}
			}
			return p;
		})(p1,p2);
		return p;
};
//获取窗口可视范围的高度
MyScroll.prototype.getClientHeight = function (){
		var clientHeight=0;  
	    if(document.body.clientHeight&&document.documentElement.clientHeight){  
	        var clientHeight=(document.body.clientHeight<document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
	    }else{  
	        var clientHeight=(document.body.clientHeight>document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
	    }  
	    return clientHeight;
};
//窗口滚动条高度
MyScroll.prototype.getScrollTop = function (){
		var scrollTop=0;  
	    if(document.documentElement&&document.documentElement.scrollTop){  
	        scrollTop=document.documentElement.scrollTop;  
	    }else if(document.body){  
	        scrollTop=document.body.scrollTop;  
	    }  
	    return scrollTop;  
};
//窗口可视范围的高度
MyScroll.prototype.getScrollHeight = function (){
		return Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);   
};
//渲染dom
MyScroll.prototype.loadBar = function (){
	var config = this.config;
	var style = 'position: fixed;top: 0px;left: 0px;'
	style+= 'background-color: '+config.color+';height: '+config.height;
	var dom = '<div id="progressBar" style="'+style+'"></div>';
	document.write(dom);
	//调试模式
	if(config.debug){
		this.loadDebug();
	}
};
//渲染调试dom
MyScroll.prototype.loadDebug = function (){
	var dom = '<div id="debugShow" style="position: fixed;top:200px;"></div>';
	document.write(dom);
};
//执行触发的事件
MyScroll.prototype.checkEvent = function (){
	event = this.event;
	if(!isEmpty(event)){
		//筛选符合条件的事件
		this.filterEvent();
	}
};
//筛选
MyScroll.prototype.filterEvent = function (){
	event = this.event;//配置对象
	var preHeight = this.preHeight;
	var nextHeight = this.nextHeight;
	for(var e in event){
		var value = event[e];
		var index=value.height.indexOf("px");
		var type = value.type?value.type:this.config.type;//获取类型
		var height = 0;
		var totalHeight = 0;
		if(index != -1){
			//高度为px
			height = value.height.substring(0, index);
		}else{
			//高度为百分比 总高度
			totalHeight = this.getScrollHeight() - this.getClientHeight();
		}
		var isConfirm = false;

		if(type=="up-down" || type=="all"){
			if(height && preHeight < height && nextHeight >= height){
				isConfirm = true;
			}else if(totalHeight && (preHeight/totalHeight).toFixed(2)<toPoint(value.height) && (nextHeight/totalHeight).toFixed(2)>=toPoint(value.height)){
				isConfirm = true;
			}
		}
		if(type=="down-up" || type=="all"){
			if(height && preHeight > height && nextHeight <= height){
				isConfirm = true;
			}else if(totalHeight && (preHeight/totalHeight).toFixed(2)>toPoint(value.height) && (nextHeight/totalHeight).toFixed(2)<=toPoint(value.height)){
				isConfirm = true;
			}
		}
		if(isConfirm){
			value.func();
			if(!value.loop){
				delete this.event[e];
			}
		}
	}
};
//判断数组是否为{}或null 空返回true
window.isEmpty = function(obj)
{
    for (var name in obj) 
    {
        return false;
    }
    return true;
};
//百分比转小数
window.toPoint = function(percent){
	var str=percent.replace("%","");
    str= str/100;
    return str;
}
