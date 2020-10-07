const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + '/date');
const mongoose = require('mongoose');


const app = express();
mongoose.connect('mongodb://localhost:27017/todoDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
    name: String
}


const Items = mongoose.model('item', itemsSchema);

const item1 = new Items({
    name: 'Welcome to your ToDo List'
})
const item2 = new Items({
    name: 'Click the "+" button to add a todo'
})
const item3 = new Items({
    name: '<--- Click this checkbox to delete a todo'
})

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model('list', listSchema);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get("/", function (req, res) {
    Items.find({}, function (err, todo) {
        if (todo.length === 0) {
            Items.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Save success');
                }
            })
            res.redirect('/');
        } else {
            res.render('list', {today: day, newtodo: todo})
        }
    })
    const day = date.getDate();
})

app.get('/:page', function (req, res) {
    List.findOne({name: req.params.page}, function (err, found) {
        if (!err) {
            if (!found) {
                const list = new List({
                    name: req.params.page,
                    items: defaultItems
                })
                list.save();
                res.redirect('/' + req.params.page);
            } else {
                res.render('list', {today: found.name, newtodo: found.items})
            }
        }

    })
})

app.post('/', function (req, res) {
    const day = date.getDate();
    const todoName = req.body.newToDo;
    const today = req.body.button;
    const todo = new Items({
        name: todoName
    })
    console.log(today)

    if (today === day) {
        todo.save();
        res.redirect('/');
    } else {
        console.log('oops, i got fired')
        List.findOne({name: today}, function (err, found) {
            if (err) {
                console.log(err)
            } else {
                found.items.push(todo);
                found.save();
                res.redirect('/' + today);

            }
        })
    }

    // if (day === today) {
    // }
    // else {
    // }

})

app.post('/delete', function (req, res) {
    const check = req.body.checkbox;
    Items.findByIdAndRemove(check, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('success');
            res.redirect('/');
        }

    })
})

app.listen(3000, function () {
    console.log('Server has started on Port 3000');
})