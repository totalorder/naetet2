# encoding: utf-8
from BaseHTTPServer import HTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler

PORT_NUMBER = 8080


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        url = self.path.split("?", 1)[0]
        if url.endswith(".html") or url.endswith(".js") or \
                url.endswith(".css") or url.endswith(".gif") or \
                url.endswith(".woff") or url.endswith(".woff2") or \
                url.endswith(".ttf") or url.endswith(".svg") or \
                url.endswith(".png"):
            SimpleHTTPRequestHandler.do_GET(self)
            return

        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        with open("index.html") as f:
            data = f.read()
            data = data.replace("//{{SETUP}}", "load_path = '%s';" % self.path)
            self.wfile.write(data)
        return

try:
    server = HTTPServer(('0.0.0.0', PORT_NUMBER), Handler)
    print 'Started httpserver on port ', PORT_NUMBER

    server.serve_forever()
except KeyboardInterrupt:
    print '^C received, shutting down the web server'
    server.socket.close()