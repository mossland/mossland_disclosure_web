require("dotenv").config();

import cf from '../config.json';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';

import DB from './db/db';

import ServerError from './util/serverError';
import { updateMarketCap, getCoinmarketCap, getCoingeckoCap, getMosslandCap } from './util/coinCap';
import Upbit from './util/upbit';
import Github from './util/github';
import Luniverse from './util/luniverse';

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


setLuniverseInfo();
setLuniverseLoop();

setGitHubInfo();
setGithubLoop();

setUpbitInfo();
setUpbitLoop();

function setLuniverseLoop (){    
    setTimeout(() => {
        setLuniverseInfo();
        setLuniverseLoop();
    }, 60 * 1000);
}

function setGithubLoop (){    
    setTimeout(() => {
        setGitHubInfo();
        setGithubLoop();
    }, 1000 * 60 * 10);
}


function setUpbitLoop (){    
    setTimeout(() => {
        setUpbitInfo();
        setUpbitLoop();
    }, 1000 * 10);
}

async function setUpbitInfo(){    
    const ub = new Upbit();
    {
        const key = 'getTickerKrw';
        const ret =  await ub.getTickerKrw();
        const jsonString = JSON.stringify(ret);
        await DB.instance.setData('upbit', key, jsonString.toString());
    }
    {
        const key = 'getYearKrw';
        const ret =  await ub.getYearKrw();
        const jsonString = JSON.stringify(ret);
        await DB.instance.setData('upbit', key, jsonString.toString());
    }
    {
        const key = 'getMonthKrw';
        const ret =  await ub.getMonthKrw();
        const jsonString = JSON.stringify(ret);
        await DB.instance.setData('upbit', key, jsonString.toString());
    }

    {
        const key = 'getWeekKrw';
        const ret =  await ub.getWeekKrw();
        const jsonString = JSON.stringify(ret);
        await DB.instance.setData('upbit', key, jsonString.toString());
    }

    {
        const key = 'getDayKrw';
        const ret =  await ub.getDayKrw();
        const jsonString = JSON.stringify(ret);
        await DB.instance.setData('upbit', key, jsonString.toString());
    }
    {
        const key = 'getOrderbookKrw';
        const ret =  await ub.getOrderbookKrw();
        const jsonString = JSON.stringify(ret);
        await DB.instance.setData('upbit', key, jsonString.toString());
    }
    {
        const key = 'getLastKrwTx';
        let ret =  await ub.getLastKrwTx();
        const jsonString = JSON.stringify(ret);
        await DB.instance.setData('upbit', key, jsonString.toString());
    }
    {
        const key = 'getAccTradeVolumeKrw';
        let ret =  await ub.getAccTradeVolumeKrw();
        const jsonString = JSON.stringify(ret);
        await DB.instance.setData('upbit', key, jsonString.toString());
    }
}

async function setGitHubInfo(){    
    const gb = new Github((cf as any).Github.Token);
    {
        const key = 'getCodeFrequency';
        let ret =  await gb.getWeeklyCodeCount();
        const jsonString = JSON.stringify(ret);
        await DB.instance.setData('github', key, jsonString.toString());
    }
    {
        const key = 'getCommitCount';
        let ret =  await gb.getWeeklyCommitCount();
        const jsonString = JSON.stringify(ret);
        await DB.instance.setData('github', key, jsonString.toString());
    }
}

async function setLuniverseInfo(){    
    const ln = new Luniverse({
        NodeId : (cf as any).Luniverse.NodeId,
        KeyId : (cf as any).Luniverse.KeyId,
        SecretKey : (cf as any).Luniverse.SecretKey,
    });
    {
        const key = 'getTotalTx';
        const ret =  await ln.getTotalTx();
        const jsonString = JSON.stringify({count : ret.toString()});
        await DB.instance.setData('luniverse', key, jsonString.toString());
    }
    {
        const key = 'getLastYearTx';
        const ret =  await ln.getLastOneYear();
        const jsonString = JSON.stringify({count : ret.toString()});
        await DB.instance.setData('luniverse', key, jsonString.toString());
    }
    {
        const key = 'getLastMonthTx';
        const ret =  await ln.getLastOneMonth();
        const jsonString = JSON.stringify({count : ret.toString()});
        await DB.instance.setData('luniverse', key, jsonString.toString());
    }
    {
        const key = 'getLastWeekTx';
        const ret =  await ln.getLastOneWeek();
        const jsonString = JSON.stringify({count : ret.toString()});
        await DB.instance.setData('luniverse', key, jsonString.toString());
    }
    {
        const key = 'getLastDayTx';
        const ret =  await ln.getLastOneDay();
        const jsonString = JSON.stringify({count : ret.toString()});
        await DB.instance.setData('luniverse', key, jsonString.toString());
    }
    {
        const key = 'getHolderCount';
        const ret =  await ln.getHolderCount();
        const jsonString = JSON.stringify({count : ret.toString()});
        await DB.instance.setData('luniverse', key, jsonString.toString());
    }
    {
        const key = 'getLastTx';
        const ret =  await ln.getLastTx();
        const jsonString = JSON.stringify(ret);
        await DB.instance.setData('luniverse', key, jsonString.toString());
    }
}



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


