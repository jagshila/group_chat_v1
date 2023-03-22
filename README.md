
# Group chat v1 APIs

Simple apis for group chat

## Getting Started

Clone the project repository by running the command below if you use SSH

```
  git clone git@github.com:jagshila/group_chat_v1.git
```

If you use https, use this instead

```
  git clone https://github.com/jagshila/group_chat_v1.git
```

Go to the project directory

```
  cd group_chat_v1
```

Install dependencies

> Node Version used - v18.15.0

```
  npm install
```

Duplicate .env.sample and rename it .env and add corresponding values


### Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGODB_URI` - MongoDb URI

`PORT` - Port used by express

`LOCAL` - Local devlopment - boolean

`TEST_ADMIN_USER_NAME` - Test admin user name

`TEST_ADMIN_PASSWORD` - Test admin password

User with specified user name and password will be created if not present

## Run locally

Start the server

```
  npm start
```

Visit localhost at specified port using browser -> localhost:8080

Swagger docs are hosted at /api-docs -> localhost:8080/api-docs

## Testing

To run tests

```
  npm run test
```
