from application.workers import celery
from celery.schedules import crontab
from application.models import *
from datetime import datetime,timedelta
import smtplib
import pandas as pd
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from jinja2 import Template
from email.mime.application import MIMEApplication
import csv
import secrets
import redis


@celery.on_after_finalize.connect
def setup_periodic_tasks(sender,**kwargs):
    sender.add_periodic_task(crontab(hour=16, minute=30),tracking.s(),name="At every day")
    sender.add_periodic_task(crontab(0, 0, day_of_month='2'),make_report_and_send.s(),name="At every 2 of month")

    
# celery.conf.beat_schedule = {
#     'add-every-30-seconds': {
#         'task': 'tasks.add',
#         'schedule': 30.0,
#         'args': (16, 16)
#     },
# }










#celery -A main.celery call application.tasks.tracking
@celery.task()
def tracking():
    for user in [i for i in User.query.all() if not 'admin' in i.email]:
        one_day_before = datetime.now().date()- timedelta(days=1)
        toaddr="0701cs201054@uecu.ac.in"
        print(f'{user.last_login_at}     {one_day_before}')
        if(user.last_login_at <= one_day_before):
            fromaddr = "badiyaritik123@gmail.com"
            s = smtplib.SMTP('smtp.gmail.com', 587)
            s.starttls()
            s.login(fromaddr, "xxxoeigjejwowjzh")


            msg = MIMEMultipart()
            msg['From'] = fromaddr
            msg['To'] = toaddr
            msg['Subject'] = "Have a Look At That"
            body = f"""Hi {user.name},

            You have not visited since last day!!!!!
            There is a lot to watch.
            

            Warm Regards,
            XXXX XXXX XXXXXX
            Contact : (+91)XXXXXXXXXX
            """
            msg.attach(MIMEText(body, 'plain'))

            text = msg.as_string()
            s.sendmail(fromaddr, toaddr, text)
            s.quit()








#celery -A main.celery call application.tasks.make_report_and_send
@celery.task()
def make_report_and_send():
    for user in [i for i in User.query.all() if not 'admin' in i.email]:
        toaddr="0701cs201054@uecu.ac.in"
        table=Booking.query.filter_by(user_id=user.id).all()
        tab=[]
        for i in table:
            try:
                vs=Venueshow.query.filter_by(id=i.venue_show_id).first()
                mname=Movie.query.filter_by(id=vs.movie_id).first().name
                vname=Venue.query.filter_by(id=vs.venue_id).first().name
                dt_object = datetime.fromtimestamp(float(i.timestamp))
                date=str(dt_object).split()[0]
                nticket=i.no_of_ticket
                tab.append([mname,vname,date,nticket,i.rating])
            except:
                pass
        df = pd.DataFrame(tab,columns=['Movie', 'Venue', 'Date', 'Num tickets', 'Rate'])
        

        
        user_data = {
            'user_name': user.name,
            'user_age': user.age,
            'user_email': user.email
        }

        template="""<!DOCTYPE html>
        <html>
        <head>
            <title>User Data Report</title>
            <style>
                body {
                    display: flex;
                    align-items: center;
                    height: 100vh;
                    flex-direction: column;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <h1>Cheers!!!!</h1>

            <h2>User Information</h2>
            <p><strong>Name:</strong> {{ user_data.user_name }}</p>
            <p><strong>Age:</strong> {{ user_data.user_age }}</p>
            <p><strong>Email:</strong> {{ user_data.user_email }}</p>

            <h2>Data Table</h2>
            {{ table_html|safe }}
        </body>
        </html>
        """
        template = Template(template)

        table_html = df.to_html(index=False, classes='table table-striped')
        html_output = template.render(user_data=user_data, table_html=table_html)

        
        fromaddr = "badiyaritik123@gmail.com"
        s = smtplib.SMTP('smtp.gmail.com', 587)
        s.starttls()
        s.login(fromaddr, "xxxoeigjejwowjzh")


        msg = MIMEMultipart()
        msg['From'] = fromaddr
        msg['To'] = toaddr
        msg['Subject'] = "Monthly Entertainment Report"
        body = f"""Hi ,

        Thats what you booked....................

        Keep visiting with us!!!!!!!!!!!!!!

        Warm Regards,
        XXXX XXXX XXXXXX
        Contact : (+91)XXXXXXXXXX
        """
        msg.attach(MIMEText(body, 'plain'))
        attachment = MIMEApplication(html_output, "html")
        attachment.add_header('Content-Disposition', f'attachment; filename="report.html"')
        msg.attach(attachment)

        text = msg.as_string()
        s.sendmail(fromaddr, toaddr, text)
        s.quit()


#celery -A main.celery call application.tasks.export_venue --kwargs='{"venue_id":80}'
@celery.task()
def export_venue(venue_id,user_id): 
    venue = Venue.query.filter_by(id=venue_id).first()
    user = User.query.filter_by(id=user_id).first()
    show_count = len(Venueshow.query.filter_by(venue_id=venue_id).all())
    theatre_data={'Name':venue.name,
        'Caption':venue.caption,
        'Capacity':venue.capacity,
        'Location':venue.city,
        'Booked Show':show_count}
    
    file_name=f"theatre_data_{venue_id}.csv"
    csv_file_path = f"./static/venue_file/{file_name}"
    with open(csv_file_path, 'w', newline='') as csv_file:
        writer = csv.writer(csv_file)
        for key, value in theatre_data.items():
            if isinstance(value, list):
                value = ', '.join(value)  
            writer.writerow([key, value])
    file_token = secrets.token_urlsafe(4)
    redis_client = redis.StrictRedis(host='localhost', port=6379, db=2)
    redis_client.setex(file_token, 3600, file_name)


    fromaddr = "badiyaritik123@gmail.com"
    toaddr = "0701cs201054@uecu.ac.in"
    s = smtplib.SMTP('smtp.gmail.com', 587)
    s.starttls()
    s.login(fromaddr, "xxxoeigjejwowjzh")


    msg = MIMEMultipart()
    msg['From'] = fromaddr
    msg['To'] = toaddr
    msg['Subject'] = "Venue File "
    body = f"""Hi {user.name},

    Venue({venue.name}) file is ready!!!
    You can access it from these token:

    {file_token}
    """
    msg.attach(MIMEText(body, 'plain'))
    text = msg.as_string()
    s.sendmail(fromaddr, toaddr, text)
    s.quit()
    return file_token
