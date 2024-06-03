from flask import render_template,jsonify,redirect,url_for,request,send_file
from flask import current_app as app
from application.models import *
from flask_login import current_user,login_user
from flask_security.decorators import roles_required,login_required,roles_accepted,auth_required
import time
from datetime import datetime,date
from application import tasks
import redis


@app.route("/",methods=['GET','POST'])    
def index():
    return render_template('index.html' )

@app.route("/home",methods=['GET','POST']) 
def home():
    if current_user.roles[0].name=='admin':
        return render_template('main_admin.html')
    else:
        return render_template('main.html')