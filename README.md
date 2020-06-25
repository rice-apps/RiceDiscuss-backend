# RiceDiscuss-backend

This is the backend for RiceDiscuss. It provides an Apollo GraphQL endpoint for a MongoDB database

## Getting started

Before starting, ask a RiceApps team lead for access to this repository.

First, clone this repository. Open your terminal and run

```
$ git clone https://github.com/rice-apps/RiceDiscuss-backend.git
```

Create a new branch, preferably naming it after yourself or the feature you're working on.

```
$ git checkout -b <your branch name>
```

To install dependencies into a local `node_modules` folder, run

```
$ npm install
```

If you do not have node and npm installed, install them from [the NodeJS website](https://nodejs.org/en/).

Finally, create a remote for your branch on github by running

```
$ git push -u origin <your branch name>
```

## Setting up your environment variables

Create a copy of the `.env.example` file located at the root of the project directory and rename the copy `.env`

Ask a current developer for the appropriate information to fill into the example.

## Submitting changes

Once you're done with your feature, create a pull request on GitHub with an informative title and description.

After a team lead merges your branch, delete both your remote and local copy.
