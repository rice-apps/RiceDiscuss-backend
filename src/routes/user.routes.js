'use strict'

import { Router } from 'express';
import bodyParser from 'body-parser';

import basicAuth from '../lib/basic-auth-middleware.js'
import User from '../models/user.js';

const authRouter = module.exports = new Router();

authRouter.post('/api/signup', jsonParser, (req, res, next) => {
    console.log('hit /api/signup')

    User.create(req.body)
        .then(token => res.send(token))
        .catch(next)
})

authRouter.get('/api/login', basicAuth, (req, res, next) => {
    console.log('hit /api/login')
  
    req.user.tokenCreate()
            .then(token => res.send(token))
            .catch(next)
})
