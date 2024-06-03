from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime


roles_users = db.Table('roles_users',
                       db.Column('user_id',db.Integer(),db.ForeignKey('user.id')),
                       db.Column('role_id',db.Integer(),db.ForeignKey('role.id')))


class User(db.Model,UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String,nullable=False)
    age = db.Column(db.Integer,nullable=False)
    gender = db.Column(db.String,nullable=False)
    email = db.Column(db.String,unique=True, nullable=False)
    password=db.Column(db.String,nullable=False)
    active=db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False) 
    last_login_at = db.Column(db.Date)
    current_login_at = db.Column(db.Date)
    last_login_ip = db.Column(db.String,default=datetime.now().strftime('%Y-%m-%d'))
    current_login_ip = db.Column(db.String)
    login_count = db.Column(db.Integer)


    roles = db.relationship('Role', secondary=roles_users,backref=db.backref('users', lazy='dynamic'))

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))    

class Booking(db.Model):
    __tablename__ = 'booking'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"),nullable=False)
    venue_show_id = db.Column(db.Integer, db.ForeignKey("venueshow.id"),nullable=False)
    no_of_ticket = db.Column(db.Integer,nullable=False)
    timestamp = db.Column(db.String, nullable=False)
    rating = db.Column(db.Integer)
class Movie(db.Model):
    __tablename__ = 'movie'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String,nullable=False)
    caption = db.Column(db.String,nullable=False)
    rating = db.Column(db.Integer,nullable=False)
    tags = db.Column(db.String,nullable=False)
    no_of_rating = db.Column(db.Integer,nullable=False)

    
class Venue(db.Model):
    __tablename__ = 'venue'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String,nullable=False)
    caption = db.Column(db.String,nullable=False)
    capacity = db.Column(db.Integer,nullable=False)
    rating = db.Column(db.Integer,nullable=False)
    address=db.Column(db.String,nullable=False)
    city = db.Column(db.String,nullable=False)
    no_of_rating = db.Column(db.Integer,nullable=False)    
class Venueshow(db.Model):
    __tablename__='venueshow'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey("movie.id"),nullable=False)
    venue_id = db.Column(db.Integer, db.ForeignKey("venue.id"),nullable=False)
    price = db.Column(db.Integer,nullable=False)  
    remaining_capacity = db.Column(db.Integer,nullable=False) 
    date=db.Column(db.String,nullable=False)
    start_time = db.Column(db.String,nullable=False) 
    end_time = db.Column(db.String,nullable=False)