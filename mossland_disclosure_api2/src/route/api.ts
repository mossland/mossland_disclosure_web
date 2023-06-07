import { Router } from "express";
import StatusCodes from 'http-status-codes';

import DB from '../db/db';
import ServerError from "../util/serverError";

const router = Router();
router.get('/market', async (req, res, next) => {
    try {
        const conn = await DB.instance.conn();
        const result = await new Promise((resolve, reject) => {
            conn.query(
                'SELECT * FROM mossland_disclosure.market_data', 
                (error, result, field)=>{
                    conn.release();
                    if (!error){
                        resolve(result);
                    }
                    else {
                        reject(error);
                    }
                }
            );
        });
        return res.status(200).send(result);
    } catch (e) {
        return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'fetch market fail', e));
    }
});

router.get('/recent_release', async (req, res, next) => {
    try {
        const conn = await DB.instance.conn();
        const result = await new Promise((resolve, reject) => {
            conn.query(
                'SELECT * FROM mossland_disclosure.release_schedule WHERE date BETWEEN NOW() - INTERVAL 3 MONTH AND NOW()', 
                (error, result, field)=>{
                    conn.release();
                    if (!error){
                        resolve(result);
                    }
                    else {
                        reject(error);
                    }
                }
            );
        });
        return res.status(200).send(result);
    } catch (e) {
        return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'fetch recent release fail', e));
    }
});

router.get('/expected_release', async (req, res, next) => {
    try {
        const conn = await DB.instance.conn();
        const result = await new Promise((resolve, reject) => {
            conn.query(
                'SELECT * FROM mossland_disclosure.release_schedule WHERE date >= CURDATE() AND date <= (CURDATE() + INTERVAL 3 MONTH)',
                (error, result, field)=>{
                    conn.release();
                    if (!error){
                        resolve(result)
                    }
                    else{
                        reject(error);
                    }
                }
            );
        });
        return res.status(200).send(result);
    } catch (e) {
        return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'fetch expected release fail', e));
    }
});


router.get('/disclosure', async (req, res, next) => {
    try {
        const conn = await DB.instance.conn();
        const result = await new Promise((resolve, reject) => {
            conn.query(
                'SELECT * FROM mossland_disclosure.disclosure ORDER BY date DESC',
                (error, result, field)=>{
                    conn.release();
                    if (!error){
                        resolve(result);
                    }
                    else{
                        reject(error);
                    }
                }
            );
        });
        return res.status(200).send(result);
    } catch (e) {
        return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'fetch expected release fail', e));
    }
});


router.get('/materials', async (req, res, next) => {
    try {
        const conn = await DB.instance.conn();
        const result = await new Promise((resolve, reject) => {
            conn.query(
                'SELECT * FROM mossland_disclosure.materials ORDER BY date DESC',
                (error, result, field)=>{
                    conn.release();
                    if (!error){
                        resolve(result);
                    }
                    else{
                        reject(error);
                    }
                }
            );
        });
        return res.status(200).send(result);
    } catch (e) {
        return next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'fetch expected release fail', e));
    }
});


router.get("/api/getTotalTx", async (req, res) => {
    const key = 'getTotalTx';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

router.get("/api/getLastYearTx", async (req, res) => {
    const key = 'getLastYearTx';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

router.get("/api/getLastMonthTx", async (req, res) => {
    const key = 'getLastMonthTx';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

router.get("/api/getLastWeekTx", async (req, res) => {
    const key = 'getLastWeekTx';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

router.get("/api/getLastDayTx", async (req, res) => {
    const key = 'getLastDayTx';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

router.get("/api/getHolderCount", async (req, res) => {
    const key = 'getHolderCount';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

router.get("/api/getLastTx", async (req, res) => {
    const key = 'getLastTx';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

router.get("/api/getTickerKrw", async (req, res) => {
    const key = 'getTickerKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

router.get("/api/getYearKrw", async (req, res) => {
    const key = 'getYearKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

router.get("/api/getMonthKrw", async (req, res) => {
    const key = 'getMonthKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

router.get("/api/getWeekKrw", async (req, res) => {
    const key = 'getWeekKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

router.get("/api/getDayKrw", async (req, res) => {
    const key = 'getDayKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

router.get("/api/getOrderbookKrw", async (req, res) => {
    const key = 'getOrderbookKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

router.get("/api/getLastKrwTx", async (req, res) => {
    const key = 'getLastKrwTx';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

router.get("/api/getAccTradeVolumeKrw", async (req, res) => {
    const key = 'getAccTradeVolumeKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

router.get("/api/getCommitCount", async (req, res) => {
    const key = 'getCommitCount';
    const ret = await db.getGithubData(key);
    return res.send(ret);
});

router.get("/api/getCodeFrequency", async (req, res) => {
    const key = 'getCodeFrequency';
    const ret = await db.getGithubData(key);
    return res.send(ret);
});

export default router;