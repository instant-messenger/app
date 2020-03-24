const server = require('./server.js');

const PORT = process.env.PORT || 3500;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});

// Co-authored-by: Tavera15 <joaquinramirez97@yahoo.com>
// Co-authored-by: angel-torres <angeltorres.dev@gmail.com>