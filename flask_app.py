from flask import Flask, render_template, url_for, request, redirect, flash, session, jsonify, escape
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_login import LoginManager, UserMixin, current_user, login_user, logout_user
from wtforms import Form, BooleanField, TextField, StringField, PasswordField, SubmitField, validators
from passlib.hash import sha256_crypt
import gc

from functools import wraps

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///main.db"
app.config['SECRET_KEY'] = 'you-will-never-guess'
db = SQLAlchemy(app)
ma = Marshmallow(app)

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

app.debug = True

class Users(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password = db.Column(db.String(128))

    def __init__(self, id, username, email, password):
        self.id = id
        self.username = username
        self.email = email
        self.password = password

class Cards(db.Model):
    __tablename__ = 'cards'
    id = db.Column('id', db.Integer, primary_key=True)
    card_no = db.Column('#', db.Unicode)
    card_set = db.Column('Set', db.Unicode)
    name = db.Column('Name', db.Unicode)
    team = db.Column('Team', db.Unicode)
    points = db.Column('Pts.', db.Unicode)
    card_year = db.Column('Yr.', db.Unicode)
    ob_c = db.Column('OB/C', db.Integer)
    speed_ip = db.Column('Spd/IP', db.Unicode)
    pos = db.Column('Pos', db.Unicode)
    hand = db.Column('H', db.Unicode)
    pu = db.Column('PU', db.Unicode)
    so = db.Column('SO', db.Unicode)
    gb = db.Column('GB', db.Unicode)
    fb = db.Column('FB', db.Unicode)
    w = db.Column('W', db.Unicode)
    s = db.Column('S', db.Unicode)
    s_plus = db.Column('S+', db.Unicode)
    double = db.Column('DB', db.Unicode)
    tr = db.Column('TR', db.Unicode)
    hr = db.Column('HR', db.Unicode)

class CardSchema(ma.ModelSchema):
    class Meta:
        model = Cards

class Lineups(db.Model):
    __tablename__ = 'lineups'
    id = db.Column('id', db.Integer, primary_key=True)
    year = db.Column('year', db.Unicode)
    abr = db.Column('abr', db.Unicode)
    name = db.Column('name', db.Unicode)
    batters = db.Column('batters', db.Unicode)
    pitchers = db.Column('pitchers', db.Unicode)
    dh = db.Column('dh', db.Unicode)

class LineupSchema(ma.ModelSchema):
    class Meta:
        model = Lineups

def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            flash("Please login.")
            return redirect(url_for('login'))
    return wrap

@app.route("/logout/")
@login_required
def logout():
    session.clear()
    flash("You have successfully logged out.")
    gc.collect()
    return redirect(url_for('quick_game'))

@app.route("/quickdraft/")
def quick_draft():
    return render_template("quickdraft.html")

@app.route("/quickgame/")
def quick_game():
    lineups = Lineups.query.all()
    return render_template("quickgame.html", lineups=lineups)

@app.route("/play/", methods=['GET'])
def play():
    if request.args.get('user') != None:
        user_team = request.args.get('user')
        dh = False
        home_team = Lineups.query.filter_by(id=request.args.get('home')).first()
        away_team = Lineups.query.filter_by(id=request.args.get('away')).first()
        user_lineup = home_team.batters.split(',')
        user_rotation = home_team.pitchers.split(',')
        cpu_lineup = away_team.batters.split(',')
        cpu_rotation = away_team.pitchers.split(',')
        away_lineup = []
        away_defense = []
        away_rotation = []
        home_lineup = []
        home_defense = []
        home_rotation = []
        for i in user_lineup:
            away_lineup.append(Cards.query.filter_by(id=int(i.split(":")[0])).first())
            away_defense.append(i.split(":")[1])
        away_rotation.append(Cards.query.filter_by(id=user_rotation[0]).first())
        for i in user_rotation[4:]:
            away_rotation.append(Cards.query.filter_by(id=i).first())
        for i in cpu_lineup:
            home_lineup.append(Cards.query.filter_by(id=int(i.split(":")[0])).first())
            home_defense.append(i.split(":")[1])
        home_rotation.append(Cards.query.filter_by(id=cpu_rotation[0]).first())
        for i in cpu_rotation[4:]:
            home_rotation.append(Cards.query.filter_by(id=i).first())

        return render_template("index.html", user_team=user_team, away_lineup=away_lineup, away_defense=away_defense, away_rotation=away_rotation, home_lineup=home_lineup, home_defense=home_defense, home_rotation=home_rotation)
    else:
        return redirect(url_for('quick_game'))

@app.route('/login/', methods=['GET','POST'])
def login():
    if request.method == "POST":
        data = Users.query.filter_by(username=request.form['username']).first()

        if data != None and sha256_crypt.verify(request.form['password'], data.password):
            session['logged_in'] = True
            session['username'] = request.form['username']

            flash("You are now logged in")
            return redirect(url_for("quick_game"))


        else:
            flash("Invalid username or password.")

    gc.collect()
    return render_template("login.html")

@app.route('/create-lineup/', methods=["GET","POST"])
def create_lineup():
    username = ""
    if request.method == "POST":
        flash("yo")
        username = request.form['name']
        flash(username)
    #cards = Cards.query.filter(Cards.pos.like("%C+%"))
    cards = "Nice"
    return render_template("create_lineup.html", username=username, cards=cards)

@app.route('/create-lineup/save/', methods=["GET","POST"])
def flash_lineup():
    username = request.form['name']
    flash("Saved!" + username)
    return redirect(url_for("create_lineup"))


class RegistrationForm(Form):
    username = TextField('Username', [validators.Length(min=4, max=20)])
    email = TextField('Email Address', [validators.Length(min=6, max=50)])
    password = PasswordField('Password', [validators.Required(),
                                          validators.EqualTo('confirm', message="Passwords must match.")])
    confirm = PasswordField('Repeat Password')

    accept_tos = BooleanField('I accept the Terms of Service and the Privacy Notice. (Last updated May 2018)', [validators.Required()])

@app.route('/register/', methods=["GET","POST"])
def register():
    try:
        form = RegistrationForm(request.form)

        if request.method == "POST" and form.validate():
            username = form.username.data
            email = form.email.data
            password = sha256_crypt.encrypt((str(form.password.data)))

            users = Users.query.filter_by(username=username).first()

            if users:
                flash("That username is already taken, please chose another.")
                render_template("register.html", form=form)

            else:
                user_id = Users.query.order_by(Users.id.desc()).first()
                user_id = int(user_id.id) + 1
                user = Users(user_id, username, email, password)
                db.session.add(user)
                db.session.commit()
                flash("Thanks for registering!")

                gc.collect()

                session['logged_in'] = True
                session['username'] = username

                return redirect(url_for('login'))

        return render_template("register.html", form=form)

    except Exception as e:
        return(str(e))

@app.route('/test/')
def test():
    lineup = Lineups.query.first()
    lineup_schema = LineupSchema()
    output = lineup_schema.dump(lineup).data
    player_list = []
    test_list = ["Hello", "Test"]
    #player_cards = Cards.query.filter_by(id=lineup.batters)
    player_schema = CardSchema(many=True)
    for i in lineup.batters:
        card_data = Cards.query.filter_by(id="9")
        card_schema = player_schema.dump(card_data).data
        player_list.append(card_schema)
    #player_card = Cards.query.filter_by(id=lineup.batters)
    players = player_schema.dump(player_list).data
    return jsonify({'lineup' : test_list}, player_list)
    #return render_template("test.html", players=player_list)

@app.route('/template/')
def template():
    return render_template("header.html")

if __name__ == "__main__":
    #app.run(host= '10.0.0.14')
    app.run()
