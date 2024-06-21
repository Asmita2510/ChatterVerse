
# ChatterVerse

Group Chat Application using Node.js



## Installation

Install my-project with npm

```bash
  cd server
  npm i
```
    
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file inside the server folder.

`TOKEN_SECRET`='Insert your key'\
`SMTP_API_KEY`='Insert your key'\
`DB_NAME`='chat_app'\
`DB_USER`='your db isntance username'\
`DB_PASSWORD`='your db instance password'\
`DB_HOST`='localhost or your hostname'

This is mandatory only if using S3 bucket to store chat images

`BUCKET_NAME`='Your S3 bucket name'\
`IAM_USER_KEY`='Your IAM user key'\
`IAM_USER_SECRET`='Your IAM user secret'

## Run Locally

Clone the project

```bash
  git clone git@github.com:Asmita2510/ChatterVerse.git
```

Go to the project directory

```bash
  cd ChatterVerse
```

Install dependencies

```bash
  cd server
  npm install
```

Start the server

```bash
  npm run start
```

In your browser : http://localhost:3000/login



