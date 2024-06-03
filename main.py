import os
from flask import Flask,request
from flask_restful import Api
from application.database import db
from application import workers
from flask_security import Security ,SQLAlchemySessionUserDatastore
from application.models import User , Role
from application.config import LocalDevelopmentConfig
from flask_login import current_user
from flask_cors import CORS 



app = None
api = None
celery = None
user_datastore=None

def create_app():
    app = Flask(__name__)
    CORS(app)
    if os.getenv('ENV',"development")=="production":
        app.logger.info("currently no production config setup")
        raise Exception ("currently no production config setup")
    else:
        app.logger.info("Starting Local Dvelopment")
        print("Starting Local Dvelopment")
        app.config.from_object(LocalDevelopmentConfig)


    app.config['SQLALCHEMY_DATABASE_URI']= "sqlite:///"+os.path.join(os.getcwd(),'database.sqlite3')

    db.init_app(app)
    app.app_context().push()

    user_datastore = SQLAlchemySessionUserDatastore(db.session,User,Role)


    security = Security(app,user_datastore,token_authentication=True)
    api = Api(app)
    app.app_context().push()      

    celery = workers.celery
    celery.conf.update(
    broker_url=app.config['CELERY_BROKER_URL'],
    result_backend = app.config['CELERY_RESULT_BACKEND'])

    celery.Task = workers.ContextTask
    app.app_context().push()
    print("app created sucessfully ")
    return app,api,celery,user_datastore

app,api,celery,user_datastore = create_app()




from application.controller import *
from application.api import *





api.add_resource(MovieAPI,  "/api/movie","/api/movie/<int:id>")
api.add_resource(VenueAPI,"/api/venue","/api/venue/<int:id>")
api.add_resource(VenueshowAPI,"/api/show","/api/show/<int:id>","/api/show/<mname>/<vname>")
api.add_resource(UserAPI,  "/api/user")
api.add_resource(Check_Uname,  "/api/check_uname/<string:uname>")
api.add_resource(show_api_with_movie,"/api/show/movie/<int:id>")
api.add_resource(show_api_with_venue,"/api/show/venue/<int:id>")
api.add_resource(booking,"/api/booking")
api.add_resource(summary,"/api/summary")
api.add_resource(Book,"/api/tbook")
api.add_resource(Export_Venue,"/api/export_venue/<int:venue_id>")
api.add_resource(Download_file,"/api/download_file/<string:token>")




if __name__=='__main__':
    app.run(port=8000,debug=True)