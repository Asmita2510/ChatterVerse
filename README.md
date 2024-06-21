# To install the dependecies for the 1st time:
1. go the the server folder - ```cd server```
2. Install dependencies - ```npm i```

# Create a file '.env' in the server folder and the following:
TOKEN_SECRET='Insert your key'\
SMTP_API_KEY='Insert your key'\
DB_NAME='chat_app'\
DB_USER='root'\
DB_PASSWORD='user'\
DB_HOST='localhost'

 The part below this is not mandatory in the .env file unless you are using S3 bucket to upload the chat images 
 This project has both the metods, storing images locally as well as on the bucket, code for storing in bucket has been commented in middlewares/multer.js and controllers/message.js 

BUCKET_NAME='Your S3 bucket name'\ 
IAM_USER_KEY='Your IAM user key'\
IAM_USER_SECRET='Your IAM user secret'\


# To run the project:
1. ```cd server```
2. Start the application - ```npm start```
3. In your browser - http://localhost:3000/login