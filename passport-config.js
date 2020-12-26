const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const Datastore = require('nedb')
const db = new Datastore({filename: 'database.db', autoload: true});

function initialize(passport){
    passport.use(new LocalStrategy({}, async (username, password, done) => {
        db.loadDatabase();
        return db.findOne({username: username}, async (err, user) => {
            if(user == null){
                return done(null, false, {message: 'No user exists with that username.'});
            }
            try{
                if(await bcrypt.compare(password, user.password)){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Wrong password.'})
                }
            }catch(err){
                return done(e);
            }
        });       
    }));
    passport.serializeUser((user, done) => done(null, user._id));
    passport.deserializeUser((id, done) => {
        db.loadDatabase();
        return db.findOne({_id: id}, (err, user) => {
            return done(null, user);
        })
    });
}
module.exports = initialize;