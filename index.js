const path = require('path');
require('dotenv').config({
    override: true,
    path: path.join(__dirname, 'development.env')
});
const express = require('express')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const {Pool, Client} = require('pg');

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT

});

(async () => {
    const client = await pool.connect();
    
    try {
    
    const {rows} = await client.query('SELECT current_user');
    const currentUser = rows[0]['current_user']
    console.log(currentUser);
  
    
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
    }
    
}) ();

app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

app.get('/favicon.ico', (req, res) => res.status(204));


app.get('/', async (req, res) => {
    const {tag} = req.query;
    
    
  
    try {
      const client = await pool.connect();
  
     
  
      if (tag) {
        
        // If tag is specified, filter records by tag
        const result = await client.query('SELECT * FROM notes WHERE tag = $1 AND isArchived = false', [tag]);
        res.render('home', { notes: result.rows });
      } else {
        // If no tag is specified, list all note titles and tags
        const result = await client.query('SELECT * FROM notes WHERE isArchived = false');
        res.render('home', { notes: result.rows });
      }
  
      client.release();
  
   
    // let notesInString = JSON.stringify(notes)
    
    } catch (err) {
        console.error(err);
    res.status(500).send('Internal Server Error')
    }
    
    
});

app.get('/archived', async (req,res) => {
    const {id} = req.params
    console.log(id);
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM notes WHERE isArchived = true');
        const archivednotes = result.rows;
        console.log(archivednotes)
        const resultId = await client.query('SELECT * FROM notes WHERE id = $1 AND isArchived = true', [id]);
        const note = resultId.rows[0]
        client.release
        res.render('archived', { notes: archivednotes, resultId: note})
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error')  
    }
    
})

app.get('/new',  async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM notes WHERE isArchived  = false');
        const notes = result.rows;
        client.release();
    res.render('new', {notes: notes})
} catch (err) {
    console.error(err);
res.status(500).send('Internal Server Error')
}
        
});

app.post('/new', async (req,res) => {
    try {
        const client = await pool.connect();
        const newNote = client.query('INSERT INTO notes(title, tag, note) VALUES($1, $2, $3)', [req.body.title, req.body.tag, req.body.note]);
        client.release();
        res.redirect('/')
        } catch (err) {
    console.error(err);
res.status(500).send('Internal Server Error')
        }
        
})

app.get('/:id', async (req, res) => {
    
    const id = req.params.id
    console.log(id)
    try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM notes WHERE isArchived = false');
    const notes = result.rows;
    const resultId = await client.query('SELECT * FROM notes WHERE id = $1', [id]);
    const note = resultId.rows[0];
    client.release();
    res.render('show', {resultId: note, notes: notes});
} catch (err) {
    console.error(err);
res.status(500).send('Internal Server Error')
}
});

app.get('/:id/edit', async (req, res) => {
    
    const noteId = req.params.id
    try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM notes');
    const notes = result.rows;
    const resultId = await client.query('SELECT * FROM notes WHERE id = $1', [noteId]);
    const note = resultId.rows[0];
    client.release();
    res.render('edit', {resultId: note, notes: notes});
} catch (err) {
    console.error(err);
res.status(500).send('Internal Server Error')
}
});



app.patch('/:id', async (req, res) => {
    const noteId = req.params.id
    try {
        const client = await pool.connect();
        const result = await client.query('UPDATE notes SET title = $1, tag = $2, note = $3 WHERE id = $4 RETURNING *', [req.body.title, req.body.tag, req.body.note, noteId]);
        client.release();
        // console.log(result.rows)
        res.redirect('/')
        } catch (err) {
    console.error(err);
res.status(500).send('Internal Server Error')
        }
})

app.delete('/:id', async (req,res) => {
    const noteId = req.params.id
    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM notes WHERE id = $1 RETURNING *', [noteId]);
        client.release();
        // console.log(result.rows)
        res.redirect('/')
        } catch (err) {
    console.error(err);
res.status(500).send('Internal Server Error')
        }

})





app.listen(3000, () => {
    console.log('Serving on port 3000')
})