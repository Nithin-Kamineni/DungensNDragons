import React, { useState } from "react";
import { DnDCharacterStatsSheet, DnDCharacterProfileSheet, DnDCharacterSpellSheet, DnDCharacter } from 'dnd-character-sheets'
import { Box, Button, Flex } from "@chakra-ui/react";
import 'dnd-character-sheets/dist/index.css'


interface CustomTabsHookProps {
  character: DnDCharacter;
  updateCharacter: any;
  scroll: boolean;
}

const PlayerProfile: React.FC<CustomTabsHookProps> = ({character, updateCharacter, scroll}) => {

  // const [character, setCharacter] = useState<DnDCharacter>(loadDefaultCharacter())
  // scroll = true;
  return (
    <>
    {!scroll ? <Box overflowY="scroll" height="100%">
      <DnDCharacterStatsSheet
      character={character}
      onCharacterChanged={updateCharacter}
    />
    <br/>
    <br/>
    </Box> : 
    <Box height="100%" style={{marginBottom:"500px"}} position={"relative"}>
    <DnDCharacterStatsSheet
    character={character}
    onCharacterChanged={updateCharacter}
  />
  </Box>}
    
    
    </>
  );
};

export default PlayerProfile;