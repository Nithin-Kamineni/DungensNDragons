"use strict";
import { none } from "fp-ts/lib/Option";
// import { loadDatabase } from "./database";
import {loadDatabase} from "./database"
const once = require("lodash/once");
const path = require("path");
const fs = require("fs-extra");
const { randomUUID } = require("crypto");
const sqlite = require("sqlite");
const { StatusCodes } = require("http-status-codes");
const BaseError = require("./error/BaseError");
const _ = require("lodash");

import { getDefaultDataDirectory } from "./util";

let dataPath= getDefaultDataDirectory()
console.log("0000000000000000000000000000")
console.log(dataPath)
console.log("0000000000000000000000000001")
dataPath = `C:\\personal\\DungeonsNDragons\\dungeon-revealer\\data`
const databasePath= path.join(dataPath, `db.sqlite`)
    
class StorePlayerStats {
  constructor(databasePath) {
    this.db= none;
    this.loadDatabasefunc(databasePath);
  }

  async loadDatabasefunc(databasePath){

    dataPath = `C:\\personal\\DungeonsNDragons\\dungeon-revealer\\data`
    console.log(dataPath,'+++++++++')
    // Connect to SQLite database
    this.db = await loadDatabase({databasePath})
  }

  async list(){
    const records = await (this.db).all(`SELECT name FROM sqlite_master WHERE type='table';`)
    const resultArray = records.map((record) => record.name);
    return resultArray;
    
  }

  async insert(body){
    const userID = body.userID;
    const userRecords = await this.selectCharectersByPlayerId(userID);
    console.log("length:",userRecords.length);
    if(userRecords.length>0){
      delete body.userID;
      let columnValues = [];
      let setColumnPlaceHolder = [];
      let i = 1;
      _.forEach(body, (columnValue, columnName) => {
        columnValues.push(columnValue);
        setColumnPlaceHolder.push(`"${columnName}" = $${i++}`);
      });
      columnValues.push(userID);
      let query = `UPDATE character_data SET ${setColumnPlaceHolder.join(", ")} WHERE userID=$${i++} RETURNING *`;
      console.log(query)
      console.log(columnValues)
      const records = await (this.db).all(query, columnValues)
      return records;
    }
    else{
      let columnNames = [];
      let columnValues = [];
      let valuesPlaceHolder = [];
      let i = 1;
      _.forEach(body, (columnValue, columnName) => {
        columnNames.push(`"${columnName}"`);
        columnValues.push(columnValue);
        valuesPlaceHolder.push(`$${i++}`);
      });
      let query = `INSERT INTO character_data (${columnNames.join(", ")}) VALUES (${valuesPlaceHolder.join(", ")}) RETURNING *`;
      
      const records = await (this.db).all(query, columnValues)

      await (this.db).all(`INSERT INTO users (userID) VALUES ("${userID}")`)

      return records;
    }
  }

  async selectCharectersByPlayerId(playerId){
    const records = await (this.db).all(`select * from "character_data" where userID='${playerId}';`)
    return records;
  }

  async selectStatusPlayerId(playerId){
    const records = await (this.db).all(`select "status" from "users" where userID='${playerId}';`)
    return records;
  }

  async selectAllCharecters(){
    const records = await (this.db).all(`select * from "character_data";`)
    return records;
  }


}

const express = require("express");
const router = express.Router();

let storePlayerStats= new StorePlayerStats(databasePath)



router.get("/test", (req, res) => {
  return res.status(200).json({
    data: {
      test: "testing running fine inside... inside player",
    },
  });
});

router.post("/test", (req, res) => {
  const body = req.body
  return res.status(200).json({
    data: {
      test: "testing running fine inside... inside player post",
      body: body
    },
  });
});

router.post("/tables", async (req, res) => {
  try{
  const dataretival = await storePlayerStats.list();
  console.log("------------------list55555555555555")
  console.log(dataretival)
  console.log("------------------list55555555555555")
  return res.status(200).json(dataretival);
}catch (err){
  console.log(`error: ${err}`);
  if (err instanceof BaseError) {
      return err.respondWithError(res);
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: "Server Error",
  });
}
});

router.post("/insert", async (req, res) => {
  try{
  const body = req.body
  console.log("came her-------------")
  const dataretival = await storePlayerStats.insert(body);
  console.log("------------------55555555555555")
  console.log(dataretival)
  console.log("------------------55555555555555")
  return res.status(200).json({
    data: {
      message: "inserted data",
      body: dataretival
    },
  });
}catch (err){
  console.log(`error: ${err}`);
  if (err instanceof BaseError) {
      return err.respondWithError(res);
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: "Server Error",
  });
}
});

router.post("/select-1", async (req, res) => {
  try{
  const body = req.body
  const dataretival = await storePlayerStats.selectAllCharecters();
  console.log("------------------55555555555555")
  console.log(dataretival)
  console.log("------------------55555555555555")
  return res.status(200).json(dataretival);
}catch (err){
  console.log(`error: ${err}`);
  if (err instanceof BaseError) {
      return err.respondWithError(res);
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: "Server Error",
  });
}
});

router.post("/status/check", async (req, res) => {
  try{
  const body = req.body
  const playerID = body.userID
  const dataretival = await storePlayerStats.selectStatusPlayerId(playerID);
  if(dataretival.length===0){
    return res.status(200).json(true);  
  }
  return res.status(200).json(dataretival[0].status==1);
}catch (err){
  console.log(`error: ${err}`);
  if (err instanceof BaseError) {
      return err.respondWithError(res);
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: "Server Error",
  });
}
});

router.post("/character", async (req, res) => {
  try{
  const body = req.body
  const playerID = body.userID
  const dataretival = await storePlayerStats.selectCharectersByPlayerId(playerID);
  if(dataretival.length>0){
    delete dataretival[0]['updatedAt']
    delete dataretival[0]['createdAt']
    return res.status(200).json(dataretival[0]);  
  }
  return res.status(200).json("NA");
}catch (err){
  console.log(`error: ${err}`);
  if (err instanceof BaseError) {
      return err.respondWithError(res);
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: "Server Error",
  });
}
});

module.exports = router;