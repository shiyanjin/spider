var http = require('http'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    request = require('request');
var i = 0;
// var url = "http://www.ss.pku.edu.cn/index.php/newscenter/news/2391"; //初始化url
var url = "http://movie.douban.com/"; //初始化url

//封装一层函数
function fetchPage(x) {
    startRequest(x);
}

function startRequest(x) {
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
            var time = $('.article-info a:first-child').next().text().trim();

            var newItem = {
                //获取文章的标题
                title:$('div.article-title a').text().trim(),
                //获取文章发表时间
                time:time,
                //获取当前文章的url
                link:"http://www.ss.pku.edu.cn" + $('div.article-title a').attr('href'),
                //获取供稿单位
                author:$('[title=供稿]').text().trim(),
                //i是用来判断获取了多少篇文章
                i:i=i + 1
            };
            console.log(newItem);

            var newTitle = $('div.article-title a').text().trim();
            savedContent($, newTitle);//存储每篇文章的内容及标题
            savedImg($, newTitle);//存储每篇文章的图片及图片标题

            //下一篇文章的url
            var nextLink = "http://www.ss.pku.edu.cn" + $('li.next a').attr('href'),
                str1 = nextLink.split('-'), // 去除url后面的中文
                str = encodeURI(str1[0]);

            //通过控制i,控制爬取文章的数量
            if(i < 5){
                fetchPage(str);
            }
        });
    }).on('error',function (err) {
        console.log(err);
    })
}

//在本地存储所爬取新闻的内容
function savedContent($,newTitle) {
    $('.article-content p').each(function () {
        var x = $(this).text();
        var y = x.substring(0,2).trim();
        if(y == ''){
            x = x + "\n";
            //将新闻文本内容一段一段添加到/data文件夹下，并用新闻的标题来命名文件
            fs.appendFile('./data/' + newTitle + '.tex', x, 'utf-8', function (err) {
                if(err){
                    console.log(err);
                }
            })
        }
    })
}

//在本地存储所爬取新闻的图片内容
function savedImg($, newTitle) {
    $('.artitle-content img').each(function () {
        var imgTitle = $(this).parent().next().trim(); // 获取图片标题
        if(imgTitle.length > 35 || imgTitle == ''){
            imgTitle = "Null";
        }
        var imgFilename = imgTitle + '.jpg';
        var imgSrc = 'http://www.ss.pku.edu.cn' + $(this).attr('src'); // 获取图片url

        //采用request模块，向服务器发起一次请求，获取图片资源
        request.head(imgSrc, function (err) {
            if(err){
                console.log(err);
            }
        });
        //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
        request(imgSrc).pipe(fs.createWriteStream('./img/' + newTitle + "——" + imgFilename));
    })
}
fetchPage(url);//运行主程序