import React, { useState } from "react";
import { DnDCharacterStatsSheet, DnDCharacterProfileSheet, DnDCharacterSpellSheet, DnDCharacter } from 'dnd-character-sheets'
import { Box, Button, Flex, ChakraProvider, SimpleGrid, Container } from "@chakra-ui/react";
import PlayerCard from "./playerCard";

import 'dnd-character-sheets/dist/index.css'

interface CustomTabsHookProps {
  loadedMapId: any;
  testString: string;
}


const PlayerStats: React.FC<CustomTabsHookProps> = () => {

  const characters = [
    {
      userID: "1",
      name: "Name",
      classLevel: "Class",
      race: "Race",
      backstory: "Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal Goal ",
      hp: 8,
      maxHp: 14
    },
    {
      userID: "2",
      name: "Product Two",
      classLevel: "Class",
      race: "Race",
      backstory: "Billy Bob Bob Bob Bob likes Markiplier gameplay videos",
      hp: 3,
      maxHp: 14
    },
    {
      userID: "3",
      name: "Long Product",
      classLevel: "Class",
      race: "Race",
      backstory: "Wow, this is very descriptive! I wonder how long it is",
      hp: 8,
      maxHp: 14
    },
    {
      userID: "3",
      name: "Long Product",
      classLevel: "Class",
      race: "Race",
      backstory: "Wow, this is very descriptive! I wonder how long it is",
      hp: 1,
      maxHp: 14
    },
    {
      userID: "3",
      name: "Long Product",
      classLevel: "Class",
      race: "Race",
      backstory: "Wow, this is very descriptive! I wonder how long it is",
      hp: 8,
      maxHp: 16
    },
  ];

  return (
    <>
    <Box overflowY="scroll" height="100%">
    <Container maxW="100rem" centerContent>
        <SimpleGrid columns={[1, 2, 3, 3]}>
          {characters.map(function (character) {
            const id = character.userID;
            const name = character.name;
            const summary = `${character.classLevel} of ${character.race}`;
            const backstory  = character.backstory;
            return (
              <PlayerCard
                key={id}
                name={name}
                summary={summary}
                backstory={backstory}
                character={character}
              />
            );
          })}
        </SimpleGrid>
      </Container>
    <br/>
    <br/>
    <br/>
    <br/>
    </Box>
    </>
  );
};

export default PlayerStats;