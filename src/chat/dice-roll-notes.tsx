import * as React from "react";
import styled from "@emotion/styled/macro";
import { Flex, Box } from "@chakra-ui/react";
import MonacoEditor from "@monaco-editor/react";
import type * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import * as Icon from "../feather-icons";
import { HtmlContainer } from "../dm-area/components/html-container";
import debounce from "lodash/debounce";
import { useStaticRef } from "../hooks/use-static-ref";
import { DraggableWindow, SetWidthHandler } from "../draggable-window";
import { usePersistedState } from "../hooks/use-persisted-state";
import { ChatMessageButton } from "../dm-area/components/chat-message-button";
import { InitiativeInputContainer } from "../dm-area/components/initiative-input-container";
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
  Center
} from '@chakra-ui/react'

const WindowContent = styled.div`
  overflow-y: scroll;
  height: 100%;
  width: 100%;
  padding: 12px;
  padding-top: 8px;
`;

const INITIAL_CONTENT = `## Basic Dice Rolling

You can roll dice by typing in the dice notation in the Chat: **[1d20]**. 
Alternatively, you can click on the common dice rolls below.

<ChatMacro message="[1d20]">
  **d20**
</ChatMacro>
<ChatMacro message="[1d12]">
  **d12**
</ChatMacro>
<ChatMacro message="[1d10]">
  **d10**
</ChatMacro>
<ChatMacro message="[1d8]">
  **d8**
</ChatMacro>
<ChatMacro message="[1d6]">
  **d6**
</ChatMacro>
<ChatMacro message="[1d4]">
  **d4**
</ChatMacro>
<ChatMacro message="[1d100]">
  **d100**
</ChatMacro>


## Formula Rolling

You can roll more complicated dice by typing in the [dice notation](https://en.wikipedia.org/wiki/Dice_notation) in the Chat:
<ChatMacro message="[3d6 + 5]">
  **[3d6 + 5]**
</ChatMacro>

The formula of a dice roll must be surrounded by square brackets.

You can also simply click the dice roll text above. It is a macro that will trigger the dice roll in the chat.


## Macro Rolling

Macros can contain text and dice rolls. Click the edit button on the top right to learn how to write your own macros.
You can simply edit this text and add macros that suit your game. They will be stored so you can access them every time you are using dungeon-revealer!

Here are some more examples:

<ChatMacro message="Magic Missle [(1d4 + 1) * 3]">Magic Missle</ChatMacro> 
 <ChatMacro message="Magic Missle [(1d4 + 1) * 4]">2nd level</ChatMacro> 
 <ChatMacro message="Magic Missle [(1d4 + 1) * 5]">3rd level</ChatMacro>

 <Checkbox>Added proficiency and other bonuses</Checkbox>
 <InitiativeInputContainer/>
    
 <ChatMacro message="Roll Initiative [20 + 5]">Type Initiative</ChatMacro>
<ChatMacro message="Roll Initiative [1d20 + 5]">Roll Initiative</ChatMacro>

<ChatMacro message="Climb [1d20 + 5][1d20 + 5][1d20 + 5]">Skill Check (DSA)</ChatMacro>

<ChatMacro message="Attack Roll [1d20 + 5] with Sword does [1d8] slasing damage">Attack with sword</ChatMacro>

<ChatMacro message="Stab the unarmed from behind!">Motivate players</ChatMacro>

It is also possible to declare re-usable templates.

<Template id="attackTemplate">
  <Box>
    <BoxRow>
      **<span style="color:red">Attack with {{weapon}}</span>**
    </BoxRow>
    <BoxRow>
      <BoxColumn>
        Attack Roll
      </BoxColumn>
      <BoxColumn>
        {{attackRollFormula}}
      </BoxColumn>
    </BoxRow>
    <BoxRow>
      <BoxColumn>
        Damage
      </BoxColumn>
      <BoxColumn>
        {{damageRollFormula}}
      </BoxColumn>
    </BoxRow>
  </Box>
</Template>

<ChatMacro
  templateId="attackTemplate"
  var-weapon="Handaxe"
  var-attackRollFormula="[1d20 + 5]"
  var-damageRollFormula="[1d6 + 6]"
>
  Attack with Handaxe
</ChatMacro>

<ChatMacro
  templateId="attackTemplate"
  var-weapon="Axe"
  var-attackRollFormula="[1d20 + 5]"
  var-damageRollFormula="[1d4 + 4]"
>
  Attack with Dagger
</ChatMacro>
`;

const usePersitedDiceNotesValue = () =>
  usePersistedState<string>("peristedDiceNotes", {
    encode: (value) => JSON.stringify(value),
    decode: (value) => {
      try {
        if (typeof value === "string") {
          const parsedValue = JSON.parse(value);
          if (typeof parsedValue === "string") {
            return parsedValue;
          }
        }
      } catch (e) {}
      return INITIAL_CONTENT;
    },
  });

export const DiceRollNotes: React.FC<{ close: () => void }> = ({ close }) => {
  const [mode, setMode] = React.useState<"read" | "write">("read");
  const editorRef =
    React.useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const [content, _setContent] = usePersitedDiceNotesValue();
  const setContent = useStaticRef(() => debounce(_setContent, 200));
  const editorOnResizeRef = React.useRef(null as null | (() => void));
  const setWidthRef = React.useRef<SetWidthHandler | null>(null);

  React.useLayoutEffect(() => {
    if (mode === "read") {
      setWidthRef.current?.((value) => Math.max(value / 2, 500));
    } else {
      setWidthRef.current?.((value) => value * 2);
    }
  }, [mode]);

  return (
    <DraggableWindow
      setWidthRef={setWidthRef}
      headerContent={
        <>
          <div style={{ fontWeight: "bold" }}>Dice Roll Notes</div>
        </>
      }
      options={[
        {
          onClick: () =>
            setMode((mode) => (mode === "read" ? "write" : "read")),
          title: mode === "read" ? "Edit" : "Save",
          icon:
            mode === "read" ? (
              <Icon.Edit boxSize="16px" />
            ) : (
              <Icon.Save boxSize="16px" />
            ),
        },
      ]}
      bodyContent={
        <Flex maxHeight="100%" height="100%">
          {mode === "write" ? (
            <Box maxWidth="50%" flex="1">
              <MonacoEditor
                language="markdown"
                options={{
                  minimap: { enabled: false },
                  lineNumbers: "off",
                  wordWrap: "on",
                  glyphMargin: false,
                  folding: false,
                  lineDecorationsWidth: 12,
                  lineNumbersMinChars: 0,
                }}
                value={content}
                onChange={(value) => value !== undefined && setContent(value)}
                onMount={(editor) => {
                  editorOnResizeRef.current = () => {
                    editor.layout();
                  };

                  editorRef.current = editor;
                }}
              />
            </Box>
          ) : null}
          <Box flex="1">
            <WindowContent>
              <HtmlContainer markdown={content} />
            </WindowContent>
          </Box>
        </Flex>
      }
      close={close}
      onKeyDown={(ev) => {
        ev.stopPropagation();
        if (ev.key !== "Escape") return;
        if (mode === "read") close();
      }}
      onDidResize={() => {
        editorOnResizeRef.current?.();
      }}
    />
  );
};

import { getUrlPrefix, buildUrl } from "../public-url";

export const InitiativeRoll: React.FC<{ close: () => void }> = ({ close }) => {

  const pathname = window.location.pathname.replace(getUrlPrefix(), "");
  console.log("InitiativeRoll",pathname.includes("dm"))

  const [mode, setMode] = React.useState<"read" | "write">("read");
  const editorRef =
    React.useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const [content, _setContent] = usePersitedDiceNotesValue();
  const setContent = useStaticRef(() => debounce(_setContent, 200));
  const editorOnResizeRef = React.useRef(null as null | (() => void));
  const setWidthRef = React.useRef<SetWidthHandler | null>(null);

  React.useLayoutEffect(() => {
    if (mode === "read") {
      setWidthRef.current?.((value) => Math.max(value / 2, 500));
    } else {
      setWidthRef.current?.((value) => value * 2);
    }
  }, [mode]);

  return (
    <DraggableWindow
      setWidthRef={setWidthRef}
      headerContent={
        <>
          <div style={{ fontWeight: "bold" }}>Inittiative Roll</div>
        </>
      }
      // options={[
      //   {
      //     onClick: () =>
      //       setMode((mode) => (mode === "read" ? "write" : "read")),
      //     title: mode === "read" ? "Edit" : "Save",
      //     icon:
      //       mode === "read" ? (
      //         <Icon.Edit boxSize="16px" />
      //       ) : (
      //         <Icon.Save boxSize="16px" />
      //       ),
      //   },
      // ]}
      bodyContent={
        <Flex maxHeight="100%" height="100%">
          <Box flex="1">
            <WindowContent>
            {pathname.includes("dm") ? 
              <>
              </>
              : 
              <>
                <Center>
                  <InitiativeInputContainer/>
                </Center>

                {/* Add option to see NPC's innitiative too in the table */}

                <TableContainer>
                  <Table variant='simple'>
                    <TableCaption>Initiative order</TableCaption>
                    <Thead>
                      <Tr>
                        <Th>Player</Th>
                        <Th isNumeric>Initiative</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>Niky</Td>
                        <Td isNumeric>25</Td>
                      </Tr>
                      <Tr>
                        <Td>feet</Td>
                        <Td isNumeric>30</Td>
                      </Tr>
                      <Tr>
                        <Td>Rogger</Td>
                        <Td isNumeric>5</Td>
                      </Tr>
                    </Tbody>
                    <Tfoot>
                      <Tr>
                        <Th>danny</Th>
                        <Th isNumeric>multiply by</Th>
                      </Tr>
                    </Tfoot>
                  </Table>
                </TableContainer>
              </>}
            </WindowContent>
          </Box>
        </Flex>
      }
      close={close}
      onKeyDown={(ev) => {
        ev.stopPropagation();
        if (ev.key !== "Escape") return;
        if (mode === "read") close();
      }}
      onDidResize={() => {
        editorOnResizeRef.current?.();
      }}
    />
  );
};
