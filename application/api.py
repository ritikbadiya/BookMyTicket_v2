from werkzeug.exceptions import HTTPException
from flask_restful import Resource,reqparse,request
from flask import make_response,jsonify,send_file
from .models import *
from application import tasks
from flask_security.decorators import roles_required,login_required,roles_accepted,auth_required
from flask_login import current_user
from datetime import datetime,date
from werkzeug.datastructures import FileStorage
import redis
user_datastore = None
import time


class NotfoundError(HTTPException):
    def __init__(self,status_code):
        self.response=make_response("",status_code)

        
class AlreadyExists(HTTPException):
    def __init__(self,status_code,code):
        self.response=make_response(f"{code} already exist",status_code)

        
class BusinessValidationError(HTTPException):
    def __init__(self,status_code,error_code,error_message):
        message={"error_code":error_code,"error_message":error_message}
        self.response=make_response(jsonify(message),status_code)


class MovieAPI(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self,id):
        if id==0:
            datas = Movie.query.all()
            res = [{'id':data.id,'name':data.name,'caption':data.caption,'rating':data.rating,'tags':data.tags} for data in datas]
            return (res)
        else:    
            data=Movie.query.filter_by(id=id).first()
            if data==None:
                raise NotfoundError(status_code=404)

            return ({'id':data.id,'name':data.name,'caption':data.caption,'rating':data.rating,'tags':data.tags})

    @auth_required('token')
    @roles_accepted('admin')
    def put(self):
        data={}
        data['id']=request.form.get("id")
        data['name']=request.form.get("name")
        data['caption']=request.form.get("caption")
        data['tags']=request.form.get("tags")
        data['image']= request.files['image']
    
        
        
        if data.get('name')==None:
            raise BusinessValidationError(status_code=400,error_code="Movie001",error_message="Movie Name is required")
        
        if data.get('caption')==None:
            raise BusinessValidationError(status_code=400,error_code="Movie002",error_message="Movie Caption is required")

        if data.get('tags')==None:
            raise BusinessValidationError(status_code=400,error_code="Movie004",error_message="Movie Tags is required")
        movie=Movie.query.filter_by(id=data['id']).first()
        if movie==None:
            raise NotfoundError(status_code=404)
        print("-------------received")
        movie.name=data.get('name')
        movie.caption=data.get('caption')
        movie.tags=data.get('tags')
        db.session.commit()
        if not data['image'].filename=='':
            data['image'].save('./static/Image/movie_'+str(data['id'])+'.jpg') 
        return ({"id": movie.id,"caption":movie.caption,"name":movie.name,"rating": movie.rating,"tags":movie.tags})

    @auth_required('token')
    @roles_required('admin')
    def delete(self,id):
        movie=Movie.query.filter_by(id=id).first()
        if movie==None:
            raise NotfoundError(status_code=404)
        db.session.delete(movie)
        db.session.commit()
        show=Venueshow.query.filter_by(movie_id=id).all()
        for i in show:
            db.session.delete(i)
            db.session.commit()
                
        return "Successfully Deleted",200

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        name=request.form.get("Name")
        caption=request.form.get("Caption")
        tags=request.form.get("Tags")
        image= request.files['image']

        if name==None:
            raise BusinessValidationError(status_code=400,error_code="Movie001",error_message="Movie Name is required")
        if caption==None:
            raise BusinessValidationError(status_code=400,error_code="Movie002",error_message="Movie Caption is required")
        if tags==None:
            raise BusinessValidationError(status_code=400,error_code="Movie004",error_message="Movie Tags is required")
        


        movie=Movie.query.filter_by(name=name).first()
        if not movie==None:
            raise AlreadyExists(code=name,status_code=409)
        new_movie=Movie(name=name,caption=caption,rating=3,tags=tags,no_of_rating=1)
        db.session.add(new_movie)
        db.session.commit()
        image.save('./static/image/movie_'+str(new_movie.id)+'.jpg')
        return ({"id": new_movie.id,"caption":new_movie.caption,"name":new_movie.name,"rating": new_movie.rating,"tags":new_movie.tags})


class VenueAPI(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self,id):
        if id==0:
            datas = Venue.query.all()
            res = [{'id':data.id,'name':data.name,'caption':data.caption,'capacity':data.capacity,'address':data.address,'city':data.city} for data in datas]
            return (res)
        data=Venue.query.filter_by(id=id).first()
        if data==None:
            raise NotfoundError(status_code=404)

        return ({'id':data.id,'name':data.name,'caption':data.caption,'capacity':data.capacity,'address':data.address,'city':data.city})  

    @auth_required('token')
    @roles_accepted('admin')
    def put(self):
        data={}
        data['id']=request.form.get('id')
        data['name']=request.form.get("name")
        data['caption']=request.form.get("caption")
        data['capacity']=request.form.get("capacity")
        data['city']=request.form.get("city")
        data['address']=request.form.get("address")
        data['image']= request.files['image']
        
        if data.get('name')==None:
            raise BusinessValidationError(status_code=400,error_code="Venue001",error_message="Venue Name is required")
        if data.get('caption')==None:
            raise BusinessValidationError(status_code=400,error_code="Venue002",error_message="Venue Caption is required")
        if data.get('capacity')==None:
            raise BusinessValidationError(status_code=400,error_code="Venue003",error_message="Venue Capacity is required")
        if data.get('address')==None:
            raise BusinessValidationError(status_code=400,error_code="Venue004",error_message="Venue Address is required")
        if data.get('city')==None:
            raise BusinessValidationError(status_code=400,error_code="Venue005",error_message="Venue City is required")
        venue=Venue.query.filter_by(id=data['id']).first()
        if venue==None:
            raise NotfoundError(status_code=404)
        venue.name=data.get('name')
        venue.caption=data.get('caption')
        venue.capacity=data.get('capacity')
        venue.address=data.get('address')
        venue.city=data.get('city')

        db.session.commit()

        if not data['image'].filename=='':
            data['image'].save('./static/Image/venue_'+str(data['id'])+'.jpg') 
        
        return ({"id": venue.id,"caption":venue.caption,"name":venue.name,"capacity": venue.capacity,"address":venue.address,"city":venue.city})
    
    @auth_required('token')
    @roles_required('admin')
    def delete(self,id):
        venue=Venue.query.filter_by(id=id).first()
        if venue==None:
            raise NotfoundError(status_code=404)
        db.session.delete(venue)
        db.session.commit()
        show=Venueshow.query.filter_by(venue_id=id).all()
        for i in show:
            db.session.delete(i)
            db.session.commit()
                
        return "Successfully Deleted",200
    

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        data={}
        data['name']=request.form.get("Name")
        data['caption']=request.form.get("Caption")
        data['capacity']=request.form.get("Capacity")
        data['city']=request.form.get("City")
        data['address']=request.form.get("Address")
        data['image']= request.files['image']

        
        

        if data.get('name')==None:
            raise BusinessValidationError(status_code=400,error_code="Venue001",error_message="Venue Name is required")
        if data.get('caption')==None:
            raise BusinessValidationError(status_code=400,error_code="Venue002",error_message="Venue Caption is required")
        if data.get('capacity')==None:
            raise BusinessValidationError(status_code=400,error_code="Venue003",error_message="Venue Capacity is required")
        if data.get('address')==None:
            raise BusinessValidationError(status_code=400,error_code="Venue004",error_message="Venue Address is required")
        if data.get('city')==None:
            raise BusinessValidationError(status_code=400,error_code="Venue005",error_message="Venue City is required")

        venue=Venue.query.filter_by(name=data.get('name')).first()
        if not venue==None:
            raise AlreadyExists(code=data.get('name'),status_code=409)
        new_Venue=Venue(name=data.get('name'),caption=data.get('caption'),capacity=data.get('capacity'),address=data.get('address'),city=data.get('city'),no_of_rating=1,rating=3)
        db.session.add(new_Venue)
        db.session.commit()
        data['image'].save('./static/image/venue_'+str(new_Venue.id)+'.jpg')

        return ({"id": new_Venue.id,"caption":new_Venue.caption,"name":new_Venue.name,"capacity": new_Venue.capacity,"address":new_Venue.address,"city":new_Venue.city})
        


    

class VenueshowAPI(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self,mname,vname):
        mid=Movie.query.filter_by(name=mname).first()
        vid=Venue.query.filter_by(name=vname).first()
        if mid==None:
            raise BusinessValidationError(status_code=400,error_code="Venueshow001",error_message="Movie does not exist")
        if vid==None:
            raise BusinessValidationError(status_code=400,error_code="Venueshow001",error_message="Venue does not exist")

        datas=Venueshow.query.filter_by(movie_id=mid.id,venue_id=vid.id).all()
        if datas==None:
            raise NotfoundError(status_code=404)       
        return ([{'id':data.id,'movie_name':mname,'venue_name':vname,'price':data.price,'remaining_capacity':data.remaining_capacity,'date':data.date,'start_time':data.start_time,'end_time':data.end_time} for data in datas])         
    
    @login_required
    @roles_accepted('user','admin')
    def get(self):
        datas = Venueshow.query.all()
        tl=[] 
        for i in datas:
            md={}
            md['movie_name']=Movie.query.filter_by(id=i.movie_id).first().name
            md['venue_name']=Venue.query.filter_by(id=i.venue_id).first().name
            md['price']=i.price
            md['remaining_capacity']=i.remaining_capacity
            md['date']=i.date

            md['start_time']=i.start_time
            md['end_time']=i.end_time
            md['id']=i.id
            tl.append(md)
        return jsonify(tl)
    

    @auth_required('token')
    @roles_required('admin')
    def delete(self,id):
        venueshow=Venueshow.query.filter_by(id=id).first()
        if venueshow==None:
            raise NotfoundError(status_code=404)
        db.session.delete(venueshow)
        db.session.commit()
                
        return "Successfully Deleted",200


    @auth_required('token')
    @roles_required('admin')
    def post(self):
        data={}
        data['mname']=request.form.get("Movie")
        data['vname']=request.form.get("Venue")
        data['price']=request.form.get("Price")
        data['date']=request.form.get("Date")
        data['start_time']=request.form.get("Start")
        data['end_time']=request.form.get("End")

        venue=Venue.query.filter_by(name=data.get('vname')).first()    
        movie=Movie.query.filter_by(name=data.get('mname')).first()    



        
        if data.get('mname')==None:
            raise BusinessValidationError(status_code=400,error_code="Venueshow007",error_message="Movie name is required")
        if data.get('vname')==None:
            raise BusinessValidationError(status_code=400,error_code="Venueshow008",error_message="Venue name is required")
        if data.get('price')==None:
            raise BusinessValidationError(status_code=400,error_code="Venueshow003",error_message="Price is required")
        if data.get('date')==None:
            raise BusinessValidationError(status_code=400,error_code="Venueshow004",error_message="Date is required")
        if data.get('price')==None:
            raise BusinessValidationError(status_code=400,error_code="Venueshow003",error_message="Price is required")
        if data.get('date')==None:
            raise BusinessValidationError(status_code=400,error_code="Venueshow004",error_message="Date is required")
        if data.get('start_time')==None:
            raise BusinessValidationError(status_code=400,error_code="Venueshow005",error_message="Start Time is required")
        if data.get('end_time')==None:
            raise BusinessValidationError(status_code=400,error_code="Venueshow006",error_message="End Time is required")
        if movie==None:
            raise BusinessValidationError(status_code=400,error_code="Venueshow001",error_message="Movie does not exist")
        if venue==None:
            raise BusinessValidationError(status_code=400,error_code="Venueshow002",error_message="Venue does not exist")
        
        new_show=Venueshow(movie_id=movie.id,venue_id=venue.id,price=data['price'],remaining_capacity=venue.capacity,date=data['date'],start_time=data['start_time'],end_time=data['end_time'])
        db.session.add(new_show)
        db.session.commit()
        return ({'id':new_show.id,'movie_name':movie.name,'venue_name':venue.name,'price':data['price'],'remaining_capacity':venue.capacity,'date':data['date'],'start_time':data['start_time'],'end_time':data['end_time']})
    


class UserAPI(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        data = {
        'user_id' : current_user.id,
        'username' : current_user.email,
        'name' : current_user.name,
        'age' : current_user.age,
        'gender' : current_user.gender
        }
        return (data)
    
    def post(self):
        name=request.form.get("Name")
        age=request.form.get("Age")
        gender=request.form.get("Gender")
        username=request.form.get("Username")
        password=request.form.get("Password")
        image= request.files['image']
        new_user = user_datastore.create_user(name=name,age=age,gender=gender,email=username, password=password,active=False)
        user_datastore.add_role_to_user(new_user, 'user')
        db.session.commit()
        image.save('./static/Image/user_'+str(new_user.id)+'.jpg')
        return {'Name':name,'age':age,'gender':gender,'email': username}


class Check_Uname(Resource):
    def get(self,uname):
        data = User.query.filter_by(email=uname).first()
        if data==None:
            return jsonify(True)
        return jsonify(False)



class show_api_with_movie(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self,id):
        datas=Venueshow.query.filter_by(movie_id=id).all()
        if datas==None:
            raise NotfoundError(status_code=404)    
        return ([{'id':data.id,'movie_id':data.movie_id,'venue_id':data.venue_id,'price':data.price,'remaining_capacity':data.remaining_capacity,'date':data.date,'start_time':data.start_time,'end_time':data.end_time} for data in datas])         

class show_api_with_venue(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self,id):
        datas=Venueshow.query.filter_by(venue_id=id).all()
        if datas==None:
            raise NotfoundError(status_code=404)    
        return ([{'id':data.id,'movie_id':data.movie_id,'venue_id':data.venue_id,'price':data.price,'remaining_capacity':data.remaining_capacity,'date':data.date,'start_time':data.start_time,'end_time':data.end_time} for data in datas])         


class booking(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        table=Booking.query.filter_by(user_id=current_user.id).all()
        tab=[]
        for i in table:
            try:
                vs=Venueshow.query.filter_by(id=i.venue_show_id).first()
                mname=Movie.query.filter_by(id=vs.movie_id).first().name
                vname=Venue.query.filter_by(id=vs.venue_id).first().name
                dt_object = datetime.fromtimestamp(float(i.timestamp))
                date=str(dt_object).split()[0]
                nticket=i.no_of_ticket
                tab.append([mname,vname,date,nticket,i.rating,i.id])
            except:
                pass
        return jsonify(tab)    
    
class summary(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        star=len([i for i in Movie.query.all() if i.rating>=4])
        vs=Venueshow.query.all()
        md={}
        vd={}
        hfs=0
        for i in vs:
            md[i.movie_id]=md.get(i.movie_id,0)+1
            vd[i.venue_id]=vd.get(i.venue_id,0)+1
            if i.remaining_capacity==0:
                hfs+=1
        mid = max(md, key= lambda x: md[x])
        movie=Movie.query.filter_by(id=mid).first().name
        vid= max(vd, key= lambda x: vd[x])
        venue=Venue.query.filter_by(id=vid).first().name
        return jsonify({'star':star,'hfs':hfs,'movie':movie,'venue':venue})
    

class Export_Venue(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self,venue_id):
        tasks.export_venue.apply_async(args=[venue_id,current_user.id],countdown=20)
        return "Task Started. You will be notified once done",200    

class Download_file(Resource):   
    def get(self,token):
        print("request received")
        redis_client = redis.StrictRedis(host='localhost', port=6379, db=2)
        filename = redis_client.get(token).decode('utf-8')

        if filename is None:
            return 'Invalid token.', 400
        else:
            return send_file(f'static/venue_file/{filename}', as_attachment=True)
        

class Book(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        user_id=current_user.id
        args=request.args.to_dict()
        show_id=args['id']
        no_of_ticket=args['nticket']
        show=Venueshow.query.filter_by(id=show_id).first()
        if int(no_of_ticket) >show.remaining_capacity or int(no_of_ticket)<1:
            return  "Not enough ticket" 
        show.remaining_capacity=show.remaining_capacity-int(no_of_ticket)
        new_book=Booking(user_id=user_id,venue_show_id=show_id,no_of_ticket=no_of_ticket,rating=3,timestamp=time.time())
        db.session.add(new_book)
        db.session.commit()

        return "Sucess",200