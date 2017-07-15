/**
 * 
 * Created by xuebj on 16/5/17.
 */

import React from 'react';
import Common from  "../../mixins/Common.js";
import "./wizard.less";

export  default class Wizard extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            items:[],
            content:""
        }
        this.searchIt = null;
        this.wizardRequestId=new Date().getMilliseconds();
        this.codes=new Array();
    }
    /**
     * 加载完成之后调用
     */
    componentDidMount () {
        Common.publish().query.add(function (codes){
            this.codes = codes;
        }.bind(this));
        window.onkeydown= function (event){
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if(e && e.keyCode == 27){//ESC
                this.setState({
                    items : []
                });
            }
        }.bind(this)
    }
    search (event) {
        let value =  event.target.value.replace(/ /g,"");
        this.setState({
            content:value
        });
        if(value == ""){
            this.setState({items:[]});
            return ;
        }
        //延迟300毫秒 防止过度请求服务器
        this.searchIt && window.clearTimeout(this.searchIt);
        this.searchIt = window.setTimeout(function (){
            this.wizardRequestId = new Date().getMilliseconds();
            Common.ajax({
                url:"/quote/"+value + "/wizard",
                requestId:this.wizardRequestId,
                success:function (data,requestId){
                    if(requestId == this.wizardRequestId && this.state.content != ""){//键盘精灵 防止上次的请求覆盖本次请求显示出来(出现在本次请求比上次请求先返回数据)
                        for(var i = 0 ;i < data.data.length ;i++){
                            data.data[i].added = this.hasAdded(data.data[i]);
                        }
                        this.setState({items:data.data});
                    }
                }.bind(this),
                error:function (jqXHR,textStatus,errorThrow){
                    this.setState({items:[]});
                    //console.error(!jqXHR.responseJSON ? jqXHR.responseJSON.message || "请求超时" : "未知错误");
                }.bind(this)
            })
        }.bind(this),300);
    }

    hasAdded (data){
        let code = data.prod_code.substr(0,data.prod_code.indexOf(".") + 1) + data.hq_type_code;
        for(var j = 0;j < this.codes.length ; j++ ){
           if(this.codes[j].prod_code === code){
               return true;
           }
        }
        return false;
    }

    /**
     * 保存自选股事件
     * @param   {Object}        prod       查询结果
     * @param   {Event}         event      事件类型
     */
    add (obj,event) {
        Common.ajax({
            url:"/optional/add",
            data:{optional:'[{"prodCode":"' + obj.prod_code.substring(0,obj.prod_code.indexOf(".")+1) + obj.hq_type_code + '","prodName":"' + obj.prod_name+'"}]"'},
            type:"post",
            success:function (data) {
                Common.publish().wizard.dispatch(obj.prod_code);
                let items = new Array();
                this.state.items.forEach(function (item){
                    if(item.prod_code == obj.prod_code){
                        item.added = true;
                        return false;
                    }
                });
                this.setState({
                    items:this.state.items
                })
            }.bind(this)
        });
    }
    render () {
        return (
            <div className="wizard">
                <div>
                    <input type="text" placeholder="输入股票代码" className="input-text radius size-L" onChange={this.search.bind(this)} value={this.state.content}/>
                </div>
                <div className="wizardItem">
                        {
                            this.state.items.map(function (obj){
                                var content = "";
                                if(obj.added){
                                    content = <span className="added">已添加</span>;
                                }else{
                                    content = <span className="add" onClick={this.add.bind(this,obj)}>+</span>;
                                }
                                return (
                                <div key={Math.random()}>
                                    <span>{obj.prod_name}({obj.prod_code})</span>
                                    {content}
                                </div>
                                );
                            }.bind(this))
                        }
                </div>
            </div>
        );
    }
}
