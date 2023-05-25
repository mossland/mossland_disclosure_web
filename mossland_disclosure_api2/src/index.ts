require("dotenv").config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';

import ServerError from './util/serverError';

import DB from './db/db';

import ApiRouter from './route/api';


DB.init();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.raw({ type: 'application/octet-stream' }));
app.use(cors());

app.use(ApiRouter);

app.use((err: ServerError, req: Request, res: Response, next: NextFunction) => {
    return res.status(err.code).json({
        ok: false,
        message: err.message,
        error: err.errorObj,
    });
});

app.listen(3000, () => console.log(`Server start on port ${process.env.DB_PORT}`));


getCoinCap();
getCoinLoop();


function getCoinLoop (){    
    setTimeout(() => {
        getCoinCap();

        getCoinLoop();
    }, 1000 * 60 * 10);
}

async function getCoinCap (){    
    getCoinmarketCap();
    getCoingeckoCap();
    getMosslandCap();
}


