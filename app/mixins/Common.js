/**
 *
 * Created by xuebj on 16/5/17.
 */

import $ from 'jquery';
import Signal from 'signals';

export default class Common{
    static publish () {
        //保证订阅对象 是全局公有的 所以定义在window对象上, class 方式定义Common 无法定义静态属性
        if(!window.optional){
            window.optional = {
                //自选股增加删除事件
                wizard:new Signal(),
                //自选股查询时间,用于设置键盘精灵查询出来的股票是否添加过自选股
                query:new Signal()
            };
        }
        return window.optional;
    } 
    /**
     * 静态属性
     * @returns {{basePath: string}} 默认ajax基础路径
     */
    static config () {
        return {
            basePath:"http://localhost:8081"
        }
    }
    /**
     * 公共ajax 方法,使用jquery进行封装,方便其他地方调用
     * @param {String}      url             请求的URL
     * @param {String}      type            method type  get,post 等
     * @param {String}      dataType        希望服务器的数据类型 默认是json
     * @param {Object}      data            参数一般为json格式的数据
     * @param {Boolean}     async           是否同步异步 默认为true 异步
     * @param {Number}      timeout         请求超时时间,默认3秒
     * @param {Function}    success         成功回调函数
     *                              参数:
     *                                  data:正确返回的数据
     * @param {Function}    error           失败回到函数
     *                              参数:
     *                                  jqXHR:Ajax对象
     *                                      jqXHR.responseText 可以取到返回的信息
     *                                      jqXHR.responseJSON 可以取到json格式的错误信息
     *                                                         (dataType必须为json,且后台返回标准的json格式错误信息) 
     *                                  textStatus:状态信息,一般是400 500 等http状态码
     *                                  errorThrow:异常信息
     * @param {Number}      requestId       请求编号,当同一个Ajax请求过快时,防止网络异常 把上一次的请求结果渲染出来。
     */
    static ajax  ({
        url="/",
        type="get",
        dataType="json",
        data={},
        async=true,
        timeout=3000,
        success=function (data){},
        error=function (jqXHR,textStatus,errorThrow){},
        requestId=0
    }) {
        $.ajax({
            url: this.config().basePath + url + "?random=" + Math.random(),
            type:type,
            dataType:dataType,
            data:data,
            async:async,
            crossDomain:true,
            scriptCharset:"UTF-8",
            timeout:timeout
        }).then(function (data){
            success(data,requestId);
        },function (jqXHR,textStatus,errorThrow){
            error(jqXHR,textStatus,errorThrow);
        })
    }

    /**
     * 获取短代码
     * @param code
     */
    static getShortCode(code) {
        let array = code.split(".");
        return array[0] + "." + array[1];
    }
}
