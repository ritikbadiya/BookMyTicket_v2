from flask_login import current_user
from datetime import datetime
from models import *
import pandas as pd
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import pandas as pd
from jinja2 import Template
import pandas as pd
from email.mime.application import MIMEApplication

def make_report_and_send():
    toaddr="0701cs201054"
    table=Booking.query.filter_by(user_id=1).all()
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
        'user_name': 'Ritik Kumar Badiya',
        'user_age': 21,
        'user_email': 'john.doe@example.com'
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

    I am writing this mail because I am looking for an internship opportunity with.

    Currently I'm pursuing master of technology in computer science from Indian Institute of Technology Bhubaneswar. I'm a full stack developer and have hands-on experience in machine learning and web development.

    Please let me know if there is any such opportunity.

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




