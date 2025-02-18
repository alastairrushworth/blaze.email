import os
import boto3
from botocore.exceptions import ClientError
from email.header import Header

class Email:
    '''
    Wrapper class for sending emails using AWS SES.
    '''
    def __init__(self):
        # Create a new SES resource and specify a region.
        self.session = boto3.Session(
            aws_access_key_id=os.environ['AWS_KEY'],
            aws_secret_access_key=os.environ['AWS_SECRET'],
            region_name='us-east-1')
        self.client = self.session.client('ses')

    def send_message(
        self, 
        sender: str, 
        sender_display: str,
        recipient: str, 
        subject: str,
        body: str
    ):
        # Try to send the email.
        sender_display_encoded = Header(sender_display, 'utf-8').encode()
        try:
            #Provide the contents of the email.
            response = self.client.send_email(
                Destination={
                    'BccAddresses': recipient,
                },
                Message={
                    'Body': {
                        'Html': {
                            'Charset': 'UTF-8',
                            'Data': body,
                        },
                    },
                    'Subject': {
                        'Charset': 'UTF-8',
                        'Data': subject,
                    },
                },
                Source=f'{sender_display_encoded} <{sender}>',
                ConfigurationSetName='default-set'
            )
        # Display an error if something goes wrong. 
        except ClientError as e:
            print(e.response['Error']['Message'])
        else:
            print("Email sent! Message ID:"),
            print(response['MessageId'])
    