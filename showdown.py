from flask import Flask, render_template, url_for, request, redirect, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

from wtforms import Form, BooleanField, TextField, StringField, PasswordField, SubmitField, validators
from passlib.hash import sha256_crypt
import gc, os, random, string

from functools import wraps

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///main.db"
app.config['SECRET_KEY'] = str(os.urandom(24))
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

class CardSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Cards
        load_instance = True

class Lineups(db.Model):
    __tablename__ = 'lineups'
    id = db.Column('id', db.Unicode, primary_key=True)
    year = db.Column('year', db.Unicode)
    abr = db.Column('abr', db.Unicode)
    name = db.Column('name', db.Unicode)
    batters = db.Column('batters', db.Unicode)
    pitchers = db.Column('pitchers', db.Unicode)
    dh = db.Column('dh', db.Unicode)
    user_id = db.Column('userID', db.Unicode)
    batters_no_dh = db.Column('battersNoDH', db.Unicode)

    def __init__(self, id, year, abr, name, batters, pitchers, dh, user_id, batters_no_dh):
        self.id = id
        self.year = year
        self.abr = abr
        self.name = name
        self.batters = batters
        self.pitchers = pitchers
        self.dh = dh
        self.user_id = user_id
        self.batters_no_dh = batters_no_dh

class LineupSchema(ma.SQLAlchemyAutoSchema):
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

@app.route("/")
def home_page():
    return render_template("home.html")

@app.route("/logout/")
@login_required
def logout():
    session.clear()
    flash("You have successfully logged out.")
    gc.collect()
    return redirect(url_for('home_page'))

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
        home_team_name = home_team.name
        home_team_abr = home_team.abr
        away_team = Lineups.query.filter_by(id=request.args.get('away')).first()
        away_team_name = away_team.name
        away_team_abr = away_team.abr
        away_lineup = []
        away_defense = []
        away_rotation = []
        home_lineup = []
        home_defense = []
        home_rotation = []
        if user_team == "home":
            user_lineup = home_team.batters.split(',')
            user_rotation = home_team.pitchers.split(',')
            cpu_lineup = away_team.batters.split(',')
            cpu_rotation = away_team.pitchers.split(',')

            for i in user_lineup:
                home_lineup.append(Cards.query.filter_by(id=int(i.split(":")[0])).first())
                home_defense.append(i.split(":")[1])
            home_rotation.append(Cards.query.filter_by(id=user_rotation[0]).first())
            for i in user_rotation[4:]:
                home_rotation.append(Cards.query.filter_by(id=i).first())
            for i in cpu_lineup:
                away_lineup.append(Cards.query.filter_by(id=int(i.split(":")[0])).first())
                away_defense.append(i.split(":")[1])
            away_rotation.append(Cards.query.filter_by(id=cpu_rotation[0]).first())
            for i in cpu_rotation[4:]:
                away_rotation.append(Cards.query.filter_by(id=i).first())
        else:
            user_lineup = away_team.batters.split(',')
            user_rotation = away_team.pitchers.split(',')
            cpu_lineup = home_team.batters.split(',')
            cpu_rotation = home_team.pitchers.split(',')
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


        return render_template("main_game.html", user_team=user_team, away_lineup=away_lineup, away_defense=away_defense, away_rotation=away_rotation, home_lineup=home_lineup, home_defense=home_defense, home_rotation=home_rotation,
                                home_team_name=home_team_name, home_team_abr=home_team_abr, away_team_name=away_team_name, away_team_abr=away_team_abr)
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
            return redirect(url_for("home_page"))


        else:
            flash("Invalid username or password.")

    gc.collect()
    return render_template("login.html")

@app.route('/cards/', methods=["GET","POST"])
def cards():
    if request.args.get('page'):
        page_no = int(request.args.get('page'))
        cards = Cards.query.filter((Cards.id > (18 * page_no) - 18) & (Cards.id < (18 * page_no) + 1))
    else:
        page_no = 1
        cards = Cards.query.limit(18)
    return render_template("cards.html", cards=cards, page_no=page_no)

@app.route('/cards/query', methods=["GET","POST"])
def cards_query():
    page_no = 1
    if request.args.get('team') != "" and request.args.get('position') != "":
        cards = Cards.query.filter((Cards.team == request.args.get('team')) & (Cards.pos.like("%" + request.args.get('position') + "%")))
    elif request.args.get('team') != "":
        cards = Cards.query.filter(Cards.team == request.args.get('team'))
    elif request.args.get('position') != "":
        cards = Cards.query.filter(Cards.pos.like("%" + request.args.get('position') + "%"))
    else:
        return redirect(url_for('cards'))
    return render_template("cards.html", cards=cards, page_no=page_no)

@app.route('/lineup/')
@login_required
def user_lineups():
    lineups = Lineups.query.filter_by(user_id = session['username'])
    batters = {}
    pitchers = {}
    for lineup in lineups:
        pitcher = lineup.pitchers.split(',')[0].strip()
        pitcher_query = Cards.query.filter_by(id=int(pitcher))
        pitchers[pitcher] = pitcher_query[0]
        for batter in lineup.batters.split(',')[0:9]:
            batter = batter.strip().split(':')[0]
            batter_query = Cards.query.filter_by(id=int(batter))
            batters[batter] = batter_query[0]

    return render_template("user_lineups.html", lineups=lineups, batters=batters, pitchers=pitchers)

@app.route('/lineup/create/', methods=["GET","POST"])
@login_required
def create_lineup():
    username = ""
    cards = Cards.query.filter(Cards.pos != "Starter").filter(Cards.pos != "Reliever").filter(Cards.pos != "Closer")
    catcher = Cards.query.filter(Cards.pos.like("%C+%"))
    firstbase = Cards.query.filter((Cards.pos.like("%1B+%")) |  (Cards.pos.like("%---%")))
    secondbase = Cards.query.filter(Cards.pos.like("%2B+%"))
    thirdbase = Cards.query.filter(Cards.pos.like("%3B+%"))
    shortstop = Cards.query.filter(Cards.pos.like("%SS+%"))
    leftfield = Cards.query.filter((Cards.pos.like("%LF%")) |  (Cards.pos.like("%OF+%")))
    centerfield = Cards.query.filter((Cards.pos.like("%CF+%")) |  (Cards.pos.like("%OF+%")))
    rightfield = Cards.query.filter((Cards.pos.like("%RF%")) |  (Cards.pos.like("%OF+%")))
    starter = Cards.query.filter(Cards.pos == "Starter")
    reliever = Cards.query.filter((Cards.pos == "Reliever") | (Cards.pos == "Closer"))
    closer = Cards.query.filter(Cards.pos == "Closer")
    return render_template("create_lineup.html", username=username, cards=cards, catcher=catcher, firstbase=firstbase, secondbase=secondbase, thirdbase=thirdbase, shortstop=shortstop,
                            leftfield=leftfield, centerfield=centerfield, rightfield=rightfield, starter=starter, reliever=reliever, closer=closer)

@app.route('/lineup/save/', methods=["POST"])
def save_lineup():
    lineup_id = Lineups.query.order_by(Lineups.id.desc()).first()
    id = ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for _ in range(6))
    year = "2018"
    abr = request.json[2]
    name = request.json[3]
    batters = ", ".join(request.json[0])
    batters_no_dh = ", ".join(request.json[4])
    pitchers = ", ".join(request.json[1])
    dh = "True"
    user_id = session['username']
    new_lineup = Lineups(id, year, abr, name, batters, pitchers, dh, user_id, batters_no_dh)
    db.session.add(new_lineup)
    db.session.commit()
    flash("Lineup Saved!")
    gc.collect()
    return "Success"


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
    return render_template("test.html")

@app.route('/lineup-test/')
def lineup_test():
    lineup = Lineups.query.first()

@app.route('/template/')
def template():
    return render_template("header.html")

if __name__ == "__main__":
    #app.run(host= '10.0.0.14')
    app.run()
