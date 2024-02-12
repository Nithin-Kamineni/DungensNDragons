"use strict";

const express = require("express");
const path = require("path");
const fs = require("fs");
const {
  handleUnexpectedError,
  getTmpFile,
  parseFileExtension,
} = require("../util");

module.exports = ({ roleMiddleware, emitter, userSessions, io }) => {
  const router = express.Router();

  router.post("/player-stats/edit/status", async (req, res) => {
    const userID = req.body.userID
    
    io.on("connection", (socket) => {
      socket.to(userSessions[userID]).emit("userID",userID)
  
      socket.emit('GetEditStatus', [userSessions,1,2,3,4]);
    })

    // emitter.emit('GetEditStatus', "sdswdsd");
    // //update userID here
    // return res.status(200).json({
    //   status: true,
    // });
  });

  router.post("/player-stats/edit/hitpoints", roleMiddleware.dm, async (req, res) => {
    return res.status(200).json({
      status: true,
    });
  });

  return { router };
};
