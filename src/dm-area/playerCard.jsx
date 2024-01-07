import React from "react";
import {
  Box,
  Flex,
  AspectRatio,
  Image,
  Text,
  Link,
  Button,
  Stack,
  useDisclosure,
  // Card, 
  // CardHeader, 
  // CardBody, 
  // CardFooter,
  Progress,
  IconButton,
  Switch,
  FormControl,
  FormLabel,
  ModalOverlay
} from "@chakra-ui/react";

import { HStack, VStack } from '@chakra-ui/react'

// import { CardFooter } from "@chakra-ui/card"

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react'

import { DeleteIcon, UnlockIcon, LockIcon,ExternalLinkIcon } from '@chakra-ui/icons'

import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react'

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'

import PlayerProfile from "./playerProfile";
import PlayerSpell from "./playerSpell";
import PlayerOther from "./playerOther";
import { matchRight } from "fp-ts/lib/ReadonlyNonEmptyArray";

function PlayerCard(props) {

  const name = props.name;
  const summary = props.summary;
  const backstory = props.backstory;
  const character = props.character;

  const maxHp = character.maxHp;
  const hp = character.hp;

  // const { product, summary, longLine } = props;
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [sidebar, setSidebar] = React.useState(false);
  const [deleteModel, setDeleteModel] = React.useState(false);


  const handleClickSidebar = () => {
    setDeleteModel(false);
    setSidebar(true);
    onOpen();
  }

  const handleClickModel = () => {
    setDeleteModel(true);
    setSidebar(false);
    onOpen();
  }

  const [lockedStatus,SetLockedStatus] = React.useState(false);
  const handleLockedStatus = () => {
    SetLockedStatus(!lockedStatus);
  }

  const OverlayTwo = () => (
    <ModalOverlay
      bg='none'
      backdropFilter='auto'
      backdropInvert='80%'
      backdropBlur='2px'
    />
  )

  return (
    <>
    <Box
    maxWidth="32rem"
    borderWidth={1}
    margin={2}
    p={5}>
      <Box 
      display={{ md: "flex" }}
      >
        <Image
          maxWidth="200px"
          margin="auto"
          // src="https://www.shareicon.net/data/512x512/2016/06/30/788946_people_512x512.png"
          src="https://i.pinimg.com/736x/60/ae/4e/60ae4e60f967adec17658dc07d8c4b99.jpg"
          alt="Woman paying for a purchase"
          boxSize='200px'
          borderRadius='full'
        />

        <Stack
          align={{ base: "center", md: "stretch" }}
          textAlign={{ base: "center", md: "left" }}
          mt={{ base: 4, md: 0 }}
          ml={{ md: 6 }}
        >
          <Text
            fontWeight="bold"
            textTransform="uppercase"
            fontSize="lg"
            letterSpacing="wide"
            color="teal.600"
          >
            {name}
          </Text>
          <Text
            color="black"
          >
            {summary}
          </Text>
          

          <HStack spacing='2px'>
          <Text my={2} color="gray.500">
            {backstory.length>20 ? "Goals: "+backstory.slice(0,20)  : "Goals: "+backstory}
          </Text>
          
          <IconButton
          isRound={true}
          variant='solid'
          colorScheme='teal'
          aria-label='Done'
          fontSize='20px'
          icon={<ExternalLinkIcon />}
          />
          </HStack>
          
          <HStack spacing='40px'>
          <Button maxWidth="100px" width="100px" my={2} onClick={() => handleClickSidebar(name)}>
            Sheet
          </Button>

          {sidebar && <Drawer onClose={onClose} isOpen={isOpen} size={'xl'}>
              <DrawerOverlay />
              <DrawerContent> 
                <DrawerCloseButton />
                <DrawerHeader>{`Character Name: ${name}`}</DrawerHeader>
                <DrawerBody>
                  <PlayerProfile scroll={true}/>
                  <PlayerSpell scroll={true}/>
                  <PlayerOther scroll={true}/>
                </DrawerBody>
              </DrawerContent>
            </Drawer  >}

            <FormControl display='flex' alignItems='center'>
              <Switch id={'email-alerts'+props.id} 
              style={{marginRight:"30px"}} 
              onChange={handleLockedStatus}
              />
              <FormLabel htmlFor={'email-alerts'+props.id} mb='4'>
              {lockedStatus ? <LockIcon/> : <UnlockIcon />}
              </FormLabel>
            </FormControl>
            </HStack>
        </Stack>
        <DeleteIcon 
        onClick={handleClickModel}
        color="red"
        />
        {deleteModel && <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <OverlayTwo />
        <ModalContent>
          <ModalHeader>Alert!!!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Want to delete {name} from the game?</Text>
          </ModalBody>
          <ModalFooter>
            <HStack spacing="10px" align="row">
              <Button color="red">Delete</Button>
              <Button onClick={onClose}>Cancel</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>}
      </Box>
      <Box>
        <br/>
        Hit Points: {`${hp}/${maxHp}`}
        <Progress colorScheme='green' value={(hp/maxHp)*100} />
        Spell Slots:
        <Progress colorScheme='purple' value={85} />
        Rations:
        <Progress colorScheme='yellow' value={70} />

        <br/>
        {/* eeeeeeeeeeeeeeeeeeeee */}


        <TableContainer>
        <Table variant='simple'>
          <TableCaption>player</TableCaption>
          <Thead>
            <Tr>
              <Th>Atributes</Th>
              <Th isNumeric>Level</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Armor Class</Td>
              <Td isNumeric>10</Td>
            </Tr>
            <Tr>
              <Td>Initiative</Td>
              <Td isNumeric>+3</Td>
            </Tr>
            <Tr>
              <Td>Speed</Td>
              <Td isNumeric>30 feet</Td>
            </Tr>
            <Tr>
              <Td>Hit Dice</Td>
              <Td isNumeric>3/3</Td>
            </Tr>
            <Tr>
              <Td>Spell Save DC</Td>
              <Td isNumeric>14</Td>
            </Tr>
            <Tr>
              <Td>Passive Perception</Td>
              <Td isNumeric>11</Td>
            </Tr>
            <Tr>
              <Td>Passive Investigation</Td>
              <Td isNumeric>12</Td>
            </Tr>
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>Experience</Th>
              <Th isNumeric> ~125</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>

        {/* eeeeeeeeeeeeeeeeeeeeee */}
      </Box>
    </Box>

    
    
    </>
  );
}

export default PlayerCard;
