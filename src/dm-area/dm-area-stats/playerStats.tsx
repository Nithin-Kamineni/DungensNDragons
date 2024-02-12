import * as React from "react";
import { DnDCharacterStatsSheet, DnDCharacterProfileSheet, DnDCharacterSpellSheet, DnDCharacter } from 'dnd-character-sheets'
import { Box, Button, Flex, ChakraProvider, SimpleGrid, Container } from "@chakra-ui/react";
import PlayerCard from "./playerCard";
import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightAddon,
  HStack
} from "@chakra-ui/react";
import { Search2Icon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
} from '@chakra-ui/react'
import 'dnd-character-sheets/dist/index.css'
import graphql from "babel-plugin-relay/macro";
import { useMutation, useQuery, ReactRelayContext } from "relay-hooks";
import {
  playerStats_userStatsStatusMutation,
} from "./__generated__/playerStats_userStatsStatusMutation.graphql";

interface CustomTabsHookProps {
  loadedMapId: any;
  testString: string;
}

const UserStatsStatusMutation = graphql`
  mutation playerStats_userStatsStatusMutation(
      $input: UserStatusInput!
    ) {
      userStatus(input: $input)
    }
`;


const PlayerStats: React.FC<CustomTabsHookProps> = () => {

  const [userStatsStatusChnageFunc] =
    useMutation<playerStats_userStatsStatusMutation>(
      UserStatsStatusMutation
    );  

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
      userID: "4",
      name: "Long Product",
      classLevel: "Class",
      race: "Race",
      backstory: "Wow, this is very descriptive! I wonder how long it is",
      hp: 1,
      maxHp: 14
    },
    {
      userID: "5",
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
    <Box>
        <Container marginTop="20px" marginBottom="20px" maxW='750px'>
          <HStack>
            <InputGroup borderRadius={5} size="sm">
              <InputLeftElement
                pointerEvents="none"
                children={<Search2Icon color="gray.600" />}
              />
              <Input type="text" placeholder="Search..." border="1px solid #949494"/>
              <InputRightAddon
                p={0}
                border="none"
              >
                <Button size="sm" borderLeftRadius={0} borderRightRadius={3.3} border="1px solid #949494" backgroundColor='blue.600' color="white">
                  Search
                </Button>
              </InputRightAddon>
            </InputGroup>

            <Menu closeOnSelect={false}>
              <MenuButton as={Button} colorScheme='teal' rightIcon={<ChevronDownIcon />}>
                Filter
              </MenuButton>
              <MenuList minWidth='250px'>
                <MenuOptionGroup defaultValue='asc' title='Name Order' type='radio'>
                  <MenuItemOption value='asc'>Ascending</MenuItemOption>
                  <MenuItemOption value='desc'>Descending</MenuItemOption>
                </MenuOptionGroup>
                <MenuDivider />
                <MenuOptionGroup title='Search' type='checkbox'>
                  <MenuItemOption value='email'>Name</MenuItemOption>
                  <MenuItemOption value='phone'>Bio</MenuItemOption>
                  <MenuItemOption value='country'>Everything</MenuItemOption>
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </HStack>
        </Container>
      </Box>

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
                id={id}
                name={name}
                summary={summary}
                backstory={backstory}
                character={character}
                userStatsStatusChnageFunc={userStatsStatusChnageFunc}
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