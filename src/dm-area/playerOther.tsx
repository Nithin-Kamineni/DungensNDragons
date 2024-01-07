import React, { useState } from "react";
import { DnDCharacterStatsSheet, DnDCharacterProfileSheet, DnDCharacterSpellSheet, DnDCharacter } from 'dnd-character-sheets'
import 'dnd-character-sheets/dist/index.css'
import { Box, Button, Flex } from "@chakra-ui/react";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import "./playerOthercss.css"

const bodyElement = document.getElementById("body");
if (!bodyElement) {
  throw new TypeError("Body Element was not found.");
}

interface CustomTabsHookProps {
  character: DnDCharacter;
  updateCharacter: any;
  scroll: boolean;
}

function loadDefaultCharacter () {
  let character: DnDCharacter = {}
  const lsData = localStorage.getItem('dnd-character-data')
  if (lsData) {
    try {
      character = JSON.parse(lsData)
    } catch {}
  }
  return character
}


const PlayerOther: React.FC<CustomTabsHookProps> = ({character, updateCharacter, scroll}) => {

  return (
    <>
    {!scroll ? <Box overflowY="scroll" height="100%">
      <DnDCharacterProfileSheet
      character={character}
      onCharacterChanged={updateCharacter}
    />
    <br/>
    <br/>
    </Box> :
    <Box style={{marginBottom:"500px"}} position={"relative"} height="100%">
    <DnDCharacterProfileSheet
    character={character}
    onCharacterChanged={updateCharacter}
    />
    <br/>
    <br/>

    </Box>
  }
    
    </>
  );
};

export default PlayerOther;