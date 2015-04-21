var jsonp_callback = null;
var jsonp_script_tag = null;

var read_cookie = function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};
jsonp_cb = function(data) {
    var cb = jsonp_callback;
    jsonp_callback = null;
    document.getElementsByTagName('head')[0].removeChild(jsonp_script_tag);
    cb(data);
};
var jsonp = function(url, cb) {
    jsonp_script_tag = document.createElement('script');
    jsonp_script_tag.type = 'text/javascript';
    jsonp_callback = cb;
    jsonp_script_tag.src = url + (url.indexOf("?") >= 0 ? "&": "?") + "callback=jsonp_cb";
    document.getElementsByTagName('head')[0].appendChild(jsonp_script_tag);
};
var query = function(q, cb) {
    jsonp("http://naetet.se/arrest.php/phpbb3_" + q, cb);
};

var php_query = function(endpoint, cb) {
    jsonp("http://naetet.se/phpbb/" + endpoint + (endpoint.indexOf("?") >= 0 ? "&": "?") + "sid=" + sid, cb);
};

nunjucks.write = function (name, ctx, cb) {
    document.getElementById("container").innerHTML = nunjucks.render(name, ctx, cb);
};

window.onload = function() {
nunjucks.configure('', { autoescape: true });

path('/forum/:id/topic/:id', function(forum_id, topic_id) {
    //query("forums/forum_id/" + forum_id + "/", function(forums) {
    //    query("topics/topic_id/" + topic_id + "/", function(topics) {
            php_query("viewtopic2.php?f=" + forum_id + "&t=" + topic_id, function(result) {
                //query("topics/forum_id/" + id + "/?by=topic_time&order=desc", function(topics) {
                for(var idx in result['posts']) {
                    result['posts'][idx].post_date = new Date(parseInt(result['posts'][idx].POST_TIME)*1000).toISOString().slice(0, 10);
                }
                nunjucks.write('topic.html', { info: result['info'], posts: result['posts']});
            });
        //});
    //});
});

path('/forum/:id', function(id) {
    php_query("viewforum2.php?f=" + id, function(result) {
    //query("forums/forum_id/" + id + "/", function(forums) {
        nunjucks.write('forum.html', { forum: result['forum'], topics: result['topics']});
        //});
    });
});

path('/login', function() {
    nunjucks.write('login.html');
});

path('/logout', function() {
    sid = undefined;
    load_path = undefined;
    nunjucks.write('logout.html');
});

path('/', function() {
    php_query("viewforum2.php?f=151", function(forums) {
        nunjucks.write('forums.html', { forums: forums });
    });
});

on_login = function(evt) {
    $.post("http://naetet.se/phpbb/ucp.php?mode=login&get=sid",
        {username: $("#username").val(),
            password: $("#password").val(),
            login: "Login"},
        function( data ) {
            if (data == "FAIL") {
                nunjucks.write('login.html', {failed: true});
            } else {
                sid = data;
                $.cookie("sid", sid, { expires: 7 });
                if (load_path === undefined || load_path === "/login") {
                    path.load("/");
                } else {
                    path.load(load_path);
                }
            }
        }
    );
};

on_logout = function() {
    $.removeCookie("sid");
    path.load("/logout");
};

on_more_posts = function() {
    event.preventDefault();
    var evt = event;
    php_query("viewtopic2.php?f=" + $(event.srcElement).data('forum-id') + "&t=" + $(event.srcElement).data('topic-id') + "&start=" + $(event.srcElement).data('previous-page'), function(result) {
        console.log("on_more_posts", result);
        //query("topics/forum_id/" + id + "/?by=topic_time&order=desc", function(topics) {
        for(var idx in result['posts']) {
            result['posts'][idx].post_date = new Date(parseInt(result['posts'][idx].POST_TIME)*1000).toISOString().slice(0, 10);
        }
        //#nunjucks.write('topic.html', { info: result['info'], posts: result['posts']});
        var renderedHtml = nunjucks.render('posts.html', { info: result['info'], posts: result['posts']});
        var parent = $($(evt.srcElement).parent());

        console.log($.parseHTML(renderedHtml));
        console.log(parent);
        $(renderedHtml).insertBefore(parent);
        parent.remove();
    });
    console.log("on_more_posts", event.srcElement);
};

if($.cookie("sid")) {
    sid = $.cookie("sid");
}

if (typeof(sid) === "undefined") {
    path.load("/login");
} else {
    if (load_path === undefined) {
        path.load("/");
    } else {
        path.load(load_path);
    }
}
};

