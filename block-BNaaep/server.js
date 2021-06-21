const http  =  require('http');
const fs = require('fs');
const qs = require('querystring');
const url = require('url');

const server = http.createServer(handleRequest);

function handleRequest(req, res) {
  let parsedUrl = url.parse(req.url, true);  
  let store = '';
    req.on('data', (chunk) => {
        store += chunk;
    });
    req.on('end', () => {
       if (req.url === '/' && req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        fs.createReadStream('./index.html').pipe(res);
       }

       else if (req.url === '/about') {
        res.setHeader('Content-Type', 'text/html');
        fs.createReadStream('./about.html').pipe(res);
      }

      else if(req.url.split('.').pop() === 'css') {
        res.setHeader('Content-Type', 'text/css');
        fs.createReadStream(`./${req.url}`).pipe(res);
      }

      else if (req.url.split('.').pop() === 'jpg' || req.url.split('.').pop() === 'png') {
        res.setHeader('Content-Type', 'image/jpg');
        fs.createReadStream(`./${req.url}`).pipe(res);
      }
       else if(req.url.split('.').pop() === 'js') {
        res.setHeader('Content-Type', 'text/js');
        fs.createReadStream(`./${req.url}`).pipe(res);
      } 
      else if(req.url === '/contact' && req.method === 'GET') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        return fs.createReadStream('./form.html').pipe(res);
    }
      else if (req.url === '/form' && req.method === 'POST'){
          let parsedData = qs.parse(store);
          let userName = parsedData.username;
          let rootPath = __dirname + '/contacts/';
          fs.open(rootPath + userName + '.json', 'wx', (err, fd) => {
              if(err)  throw new Error(`${userName} already exits`);
              fs.write(fd, JSON.stringify(parsedData), (err) => {
                  if(err) return console.log(err);
                  fs.close(fd, (err) => {
                      if(err) return console.log(err);
                      else {
                        return res.end('Contact Saved');
                      }
                  })
              })
          })
      }
      else if(parsedUrl.pathname === '/users' && req.method === 'GET') {
        let user = parsedUrl.query.username;
        let path = __dirname + '/contacts/' + user + '.json';
        let rootFolder = __dirname + '/contacts';
        if(user) {
           
            fs.readFile(path, (err, content) => {
                if(err) return console.log(err);
                
                let data = (JSON.parse(content.toString()));
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(`<h2>${data.name}</h2>`);
                res.write(`<h2>${data.email}</h2>`);
                res.write(`<h2>${data.username}</h2>`);
                res.write(`<h2>${data.age}</h2>`);
                res.write(`<h2>${data.bio}</h2>`);
                return res.end();
            });
        
        } else {
                let files = fs.readdirSync(rootFolder);
                let contacts = files.map((file) => {
                    return JSON.parse(fs.readFileSync(rootFolder + "/" + file));                    
                });

                let datas = "";

                contacts.forEach((contact) => {
                    datas += 
                    `<h2>${contact.name}</h2>
                     <h2>${contact.email}</h2>
                    <h2>${contact.username}</h2>
                    <h2>${contact.age}</h2>
                    <h2>${contact.bio}</h2>`;
                })

                res.writeHead(200, {'Content-Type': 'text/html'});
                return res.end(datas);    
            }   
        }
       else {
        res.statusCode = 404;
        res.end('Page not found');
      }    
    });
};

server.listen(5000, () => {
    console.log('Server listening on port 5k!');
});