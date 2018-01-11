var http = require('http'),
    fs = require('fs'),
    cheerio = require('cheerio');
var i = 0;

var url = "http://news.baidu.com/"; //初始化url

//封装一层函数
function fetchPage(x,i) {
    startRequest(x,i);
}

function startRequest(x, i) {
    //采用http模块向服务器发起一次请求
    http.get(x, function (res) {
        var html = "";
        res.setEncoding('utf-8');//防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data',function (chunk) {
            html += chunk;
        });

        //监听end事件，如果整个网页内容的HTML都获取完毕，执行回调函数
        res.on('end',function () {
            var $ = cheerio.load(html); //采用cheerio模块解析html
            var selector = '.hdline' + i + ' strong a:first-child';

            var title = $(selector).text().trim();
            var urlHot = $(selector).attr('href');

            var newItem = {
                title:title,
                url:urlHot,
                i: i = i + 1
            };
            console.log(newItem);

            var time = new Date();
            var year = time.getFullYear();
            var month = time.getMonth() + 1;
            var date = time.getDate();
            var newTitle  = year + "-" + month + "-" + date;
            console.log(newTitle);
            savedNews(newItem, newTitle);

            if(i < $('.hotnews ul li').length){
                fetchPage(url, i);
            }
         });
    }).on('error',function (err) {
        console.log(err);
    })
}

/*在本地存储结果*/
function savedNews(newItem, newTitle) {
    var x = [];
    x.push(newItem.title + '\n', newItem.url + '\n');
    console.log(x);
    fs.appendFile("./data/" + newTitle + '.txt',x , 'utf-8', function (err) {
        if(err){
            console.log(err);
        }

    })
}
fetchPage(url,i);//运行主程序