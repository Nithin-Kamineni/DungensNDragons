import React, { useState, useEffect } from 'react'
// import {
//   Switch,
//   Route,
//   Link,
//   withRouter,
//   Redirect,
//   useLocation
// } from 'react-router-dom'
import { DnDCharacterStatsSheet, DnDCharacterProfileSheet, DnDCharacterSpellSheet, DnDCharacter } from 'dnd-character-sheets'
import { Box, Button, Flex } from "@chakra-ui/react";
import 'dnd-character-sheets/dist/index.css'

interface CustomTabsHookProps {
  character: DnDCharacter;
  updateCharacter: any;
  scroll: boolean;
}


const PlayerSpell: React.FC<CustomTabsHookProps> = ({character, updateCharacter, scroll}) => {

  return (
    <>
    {!scroll ? <Box overflowY="scroll" height="100%">
      <DnDCharacterSpellSheet
      character={character}
      onCharacterChanged={updateCharacter}
    />
    <br/>
    <br/>
    </Box> :
    <Box height="100%" style={{marginBottom:"500px"}} position={"relative"}>
    <DnDCharacterSpellSheet
    character={character}
    onCharacterChanged={updateCharacter}
  />
  <br/>
  <br/>
  </Box>}
    
    </>
  );
};

export default PlayerSpell;