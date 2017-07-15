/**
 *
 * Created by xuebj on 16/5/20.
 */
import React from 'react';
import $ from 'jquery';
import Common from '../../mixins/Common.js';
import "./item.less";

export default class OptionalItem extends React.Component {
    constructor (props){
        super(props);
        this.state  = {
            items:[],
            codes:[],
            height : $("body").height() - 41 + "px"
        }
        this.itvertal = null;
    }

    /**
     * 渲染之前调用
     */
    componentWillMount () {
        window.onresize=function(){
            this.setState({
                height:$("body").height() - 41 + "px"
            })
        }.bind(this)
        this.query();
    }

    /**
     * 加载完成之后调用
     */
    componentDidMount (){
        Common.publish().wizard.add(function (){
            this.itvertal && window.clearInterval(this.itvertal);
            this.query();
            this.queryQuote(this.state.codes);
            this.itvertal = window.setInterval(this.queryQuote.bind(this),5000);
        }.bind(this))
        this.queryQuote(this.state.codes);
        this.itvertal = window.setInterval(this.queryQuote.bind(this),5000);
    }

    componentWillUnmount (){
        window.clearInterval(this.itvertal);
    }

    query () {
        Common.ajax({
            url:"/optional/query",
            async:false,
            success:function (optionals) {
                let codes = new Array();
                for(let obj in optionals){
                    codes.push({
                        prod_code:optionals[obj].prodCode,
                        prod_name:optionals[obj].prodName,
                        id:optionals[obj].id
                    })
                }
                Common.publish().query.dispatch(codes);
                this.setState({
                    codes:codes
                })
            }.bind(this)
        })
    }



    /**
     * 查询行情
     */
    queryQuote () {
        let items = this.state.codes;
        let codes =  new Array();
        for(let code in items){
            codes.push(items[code].prod_code)
        }
        Common.ajax({
            url:"/quote/" + codes[0] + "/real",
            data:{codes:codes.join(",")},
            success:function (result){
                let quotes = result.data.snapshot;
                let allItems = new Array();
                for(let c in items){
                    let oldItem =  this.getItem(items[c].prod_code);
                    let quote = quotes[Common.getShortCode(items[c].prod_code)];
                    let item = {
                        prod_code:items[c].prod_code,
                        prod_name:items[c].prod_name,
                        id:items[c].id
                    };
                    if(oldItem){
                        item.divUpAndDownClassName = quote[12] > oldItem.last_px ? "up":(quote[12] < oldItem.last_px? "down":"");
                    }else {
                        item.divUpAndDownClassName = "";
                    }
                    item.upAndDownClassName = quote[10] > 0 ? "up" : (quote[10] < 0 ? "down":"");
                    item.last_px = quote[12];
                    item.px_change_rate = quote[11];
                    item.px_change= quote[10];
                    let offerGrop = quote[14].split(",");
                    let bidGroup = quote[15].split(",");
                    item.offer_1 = offerGrop[0];
                    item.bid_1 = bidGroup[0];
                    allItems.push(item);
                }
                this.setState({
                    items:allItems
                });
            }.bind(this)
        })
    }

    getItem (code){
        var it;
        this.state.items.forEach(function (item){
            if(item.prod_code == code){
                it= item;
                return;
            }
        });
        return it;
    }

    del (id) {
        Common.ajax({
            url:"/optional/remove",
            type:"post",
            data:{_method:"delete",optional:'[{"id":"' + id +'"}]'},
            success:function (){
                //删除js中的自选股
                let items = new Array();
                let codes = new Array();
                this.state.items.forEach(function (item){
                    if(item.id != id){
                        items.push(item);
                        codes.push({
                            prod_code:item.prod_code,
                            prod_name:item.prod_name,
                            id:item.id
                        })
                    }
                });
                this.setState({
                    items : items,
                    codes : codes
                });
            }.bind(this)
        })
    }

    render () {
        return <div className="items" style={{"height":this.state.height}}>
            {
                this.state.items.map(function (item){
                    return <div className={"item " + item.divUpAndDownClassName } key={Math.random()}>
                            <div className="title">{item.prod_name}({Common.getShortCode(item.prod_code)})</div>
                            <div className="operator" onClick={this.del.bind(this,item.id)}>x</div>
                            <div className="content">
                                <div className="first">{item.offer_1}</div>
                                <div className="red">卖</div>
                            </div>
                            <div className="content">
                                <div className="first">{item.bid_1}</div>
                                <div className="green">买</div>
                            </div>
                            <div className="bottom">
                                <span>{item.last_px}</span>
                                <span className={item.upAndDownClassName}>{item.px_change_rate}%</span>
                            </div>
                        </div>
                }.bind(this))
            }
            </div>

    }
}
