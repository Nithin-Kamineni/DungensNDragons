import * as React from "react";
import useAsyncEffect from "@n1ru4l/use-async-effect";
import { ReactRelayContext, useMutation, useQuery } from "relay-hooks";
import graphql from "babel-plugin-relay/macro";
import styled from "@emotion/styled/macro";
import { Toolbar } from "./toolbar";
import * as Icon from "./feather-icons";
import { SplashScreen } from "./splash-screen";
import { AuthenticationScreen } from "./authentication-screen";
import { buildApiUrl } from "./public-url";
import { AuthenticatedAppShell } from "./authenticated-app-shell";
import { useSocket } from "./socket";
import { animated, useSpring, to } from "react-spring";
import { MapView, MapControlInterface } from "./map-view";
import { useGesture } from "react-use-gesture";
import { randomHash } from "./utilities/random-hash";
import { useWindowDimensions } from "./hooks/use-window-dimensions";
import { usePersistedState } from "./hooks/use-persisted-state";
import { PlayerMapTool } from "./map-tools/player-map-tool";
import { DnDCharacterStatsSheet, DnDCharacterProfileSheet, DnDCharacterSpellSheet, DnDCharacter } from 'dnd-character-sheets'
import {
  ComponentWithPropsTuple,
  FlatContextProvider,
} from "./flat-context-provider";
import {
  MarkAreaMapTool,
  MarkAreaToolContext,
} from "./map-tools/mark-area-map-tool";
import {
  NoteWindowActionsContext,
  useNoteWindowActions,
} from "./dm-area/token-info-aside";
import { playerArea_PlayerMap_ActiveMapQuery } from "./__generated__/playerArea_PlayerMap_ActiveMapQuery.graphql";
import { playerArea_MapPingMutation } from "./__generated__/playerArea_MapPingMutation.graphql";
import { UpdateTokenContext } from "./update-token-context";
import { LazyLoadedMapView } from "./lazy-loaded-map-view";
import { RulerMapTool } from "./map-tools/ruler-map-tool";
import { DragPanZoomMapTool } from "./map-tools/drag-pan-zoom-map-tool";
import {
  LeftToolbarContainer,
  MenuItemRenderer,
  ToolMapRecord,
} from "./dm-area/dm-map";

import PlayerProfile from "./dm-area/playerProfile";
import PlayerSpell from "./dm-area/playerSpell"
import PlayerOther from "./dm-area/playerOther";
// import Input from '@mui/material/Input';
import { InputGroup,InputLeftElement,Avatar, Stack, IconButton } from "@chakra-ui/react";
import EditOffIcon from '@mui/icons-material/EditOff';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';

import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Close from "@material-ui/icons/Close";
import { makeStyles } from "@material-ui/styles";

//// add tabs bar
import { AppBar, Tabs, Tab, Grid, Button } from "@material-ui/core";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { ThemeProvider } from "@emotion/react";
import { Input } from '@chakra-ui/react'
import DnDCharacterDB from "./dm-area/playerDBschema"
import ApiCallComponent from "./request/ApiCallComponent";
// import { SlLogin } from "react-icons/sl";
import {playerArea_userStatsStatusQuery} from "./__generated__/playerArea_userStatsStatusQuery.graphql"


interface IHash {
  [key: number]: any;
}

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    marginTop: "60px",
    width: "100%",
    backgroundColor: "#fff",
  },
  appBar: {
    color: "white",
    backgroundColor: "#4d4d4d",
    "& .myTab": {
      backgroundColor: "yellow",
      color: "white",
    },
  },
}));

const ToolbarContainer = styled(animated.div)`
  position: absolute;
  display: flex;
  justify-content: center;
  pointer-events: none;
  user-select: none;
  top: 0;
  left: 0;
`;

const AbsoluteFullscreenContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

type MarkedArea = {
  id: string;
  x: number;
  y: number;
};

const createCacheBusterString = () =>
  encodeURIComponent(`${Date.now()}_${randomHash()}`);

const PlayerMap_ActiveMapQuery = graphql`
  query playerArea_PlayerMap_ActiveMapQuery @live {
    activeMap {
      id
      grid {
        color
        offsetX
        offsetY
        columnWidth
        columnHeight
      }
      ...mapView_MapFragment
    }
  }
`;

const MapPingMutation = graphql`
  mutation playerArea_MapPingMutation($input: MapPingInput!) {
    mapPing(input: $input)
  }
`;

const UserStatsStatusQuery = graphql`
query playerArea_userStatsStatusQuery @live{
  userStatsStatus
}`

const playerTools: Array<ToolMapRecord> = [
  {
    name: "Move",
    icon: <Icon.Move boxSize="20px" />,
    tool: DragPanZoomMapTool,
    MenuComponent: null,
  },
  {
    name: "Ruler",
    icon: <Icon.Ruler boxSize="20px" />,
    tool: RulerMapTool,
    MenuComponent: null,
  },
  {
    name: "Mark",
    icon: <Icon.Crosshair boxSize="20px" />,
    tool: MarkAreaMapTool,
    MenuComponent: null,
  },
];

const PlayerMap = ({
  fetch,
  socket,
  isMapOnly,
}: {
  fetch: typeof window.fetch;
  socket: ReturnType<typeof useSocket>;
  isMapOnly: boolean;
}) => {

  const classes = useStyles();

  const [tabList, setTabList] = React.useState([
    {
      key: 0,
      id: 0,
    }
  ]);

  const [bodyComponent, setBodyComponent] = React.useState<IHash>({ 0: "Game Map", 1: "Player Stats Sheet", 2: "Players Spells Sheet", 3: "Players Profile Sheet" });

  const [tabValue, setTabValue] = React.useState(0);
  const handleTabChange = (_event: React.ChangeEvent<{}>, value: number) => {
    setTabValue(value);
  };
  
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [userName, setUserName] = React.useState("");
  const [editStatus, setEditStatus] = React.useState(false);

  async function loadStatusInit () {
    let currStatus = await ApiCallComponent({requestType:"POST", apiPath:"/api/player/status/check", body:{userID: userName}});
    if(currStatus!==undefined){
      return currStatus;
    }
    return true;
  }

  async function loadStatus () {
    let currStatus = await ApiCallComponent({requestType:"POST", apiPath:"/api/player/status/check", body:{userID: userName}});
    if(currStatus!==undefined){
      setEditStatus(currStatus);
    }
  }

  
  
  // setInterval(() => {
  //   loadStatus()
  // }, 10000);

  React.useEffect(()=>{
    loadStatus()
  },[loggedIn])

  let handleInputChange = (e: any) => {
    let inputValue = e.target.value
    setUserName(inputValue)
  }

  const handleLoggedIn = async () => {
    setTabList([
      {
        key: 0,
        id: 0,
      },
      {
        key: 1,
        id: 1,
      },
      {
        key: 2,
        id: 2,
      },
      {
        key: 3,
        id: 3,
      }
    ]);
    sessionStorage.setItem('userName',userName);
    setLoggedIn(true);
    await loadUserCharacter();
  };

  const handleLoggedOut = () => {
    setTabList([
      {
        key: 0,
        id: 0,
      }
    ]);
    sessionStorage.setItem('userName',"NA");
    setLoggedIn(false);
    setTabValue(0);
  };

  const sendTab = () => {
    const status = true;
    if(status===true){
      CharacterToDB(character);
      // green toast
    } else {
      // red toast
    }
  };

  async function loadUserCharacter () {
    console.log('-------------4')
    console.log('000000000000000000000000000000000000000')
    const DBchar = await DBToCharacter(userName)
    
    console.log(DBchar);
    setCharacter(DBchar);
    console.log('-------------4')
    console.log('000000000000000000000000000000000000000')
  }
  
  const [character, setCharacter] = React.useState<DnDCharacter>(loadDefaultCharacter())

  function loadDefaultCharacter () {
    let character: DnDCharacter = {}
    const lsData = localStorage.getItem('dnd-character-data')
    if (lsData) {
      try {
        character = JSON.parse(lsData)
      } catch {

      }
    }
    return character
  }

  const testUser = "test";

  async function updateCharacter (character: DnDCharacter) {
    setCharacter(character)
    console.log("main",character)
    // let dbchar = await CharacterToDB(character);
    // let char = await DBToCharacter(dbchar);
    // // setCharacter(char);
    localStorage.setItem('dnd-character-data', JSON.stringify(character))
  }

  interface CustomTabsHookProps {
    character: DnDCharacter;
  }

  async function CharacterToDB (character: DnDCharacter) {
    delete character.factionImg
    delete character.appearance
    let charDbInstance =  new DnDCharacterDB()
    Object.keys(character).forEach((key) => {
      charDbInstance[key]=JSON.stringify(character[key]);
    });
    charDbInstance.userID=userName
    let result = await ApiCallComponent({requestType:"POST", apiPath:"/api/player/insert", body:charDbInstance})
    return charDbInstance;
  }



  async function DBToCharacter (testUser: string) {
    let result = await ApiCallComponent({requestType:"POST", apiPath:"/api/player/character", body:{userID: testUser}})
    
    let charInstance =  new DnDCharacter()
    if(result==="NA"){
      //toast red no user name from server
      return charInstance;
    }
    if(result!==undefined){
      //toast green
      console.log("kes1",result)
      let characterDB: any = result
      
      console.log("kes2",characterDB)
      
      Object.keys(characterDB).forEach(async (key) => {
        if(characterDB[key]!=undefined){
          charInstance[key]=JSON.parse(characterDB[key]);
        } else {
          charInstance[key]=undefined;
        }
      });
    return charInstance;
    }
    else{
    //toast red
    return charInstance
    }
  }

  const currentMap = useQuery<playerArea_PlayerMap_ActiveMapQuery>(
    PlayerMap_ActiveMapQuery
  );
  const [mapPing] = useMutation<playerArea_MapPingMutation>(MapPingMutation);

  const mapId = currentMap?.data?.activeMap?.id ?? null;
  const showSplashScreen = mapId === null;

  const controlRef = React.useRef<MapControlInterface | null>(null);
  const [markedAreas, setMarkedAreas] = React.useState<MarkedArea[]>(() => []);

  React.useEffect(() => {
    const contextmenuListener = (ev: Event) => {
      ev.preventDefault();
    };
    return () => {
      window.addEventListener("contextmenu", contextmenuListener);
      window.removeEventListener("contextmenu", contextmenuListener);
    };
  }, []);

  React.useEffect(() => {
    const listener = () => {
      if (document.hidden === false) {
        currentMap.retry();
      }
    };

    window.document.addEventListener("visibilitychange", listener, false);

    return () =>
      window.document.removeEventListener("visibilitychange", listener, false);
  }, []);

  const updateToken = React.useCallback(
    ({ id, ...updates }) => {
      if (currentMap.data?.activeMap) {
        fetch(`/map/${currentMap.data.activeMap.id}/token/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...updates,
            socketId: socket.id,
          }),
        });
      }
    },
    [currentMap, fetch]
  );

  const [toolbarPosition, setToolbarPosition] = useSpring(() => ({
    position: [12, window.innerHeight - 50 - 12] as [number, number],
    snapped: true,
  }));

  const [showItems, setShowItems] = React.useState(true);

  const [activeToolId, setActiveToolId] = React.useState(
    playerTools[0].tool.id
  );

  const userSelectedTool = React.useMemo(() => {
    return (
      playerTools.find((tool) => tool.tool.id === activeToolId) ??
      playerTools[0]
    ).tool;
  }, [activeToolId]);

  const isDraggingRef = React.useRef(false);

  const windowDimensions = useWindowDimensions();

  React.useEffect(() => {
    const position = toolbarPosition.position.get();
    const snapped = toolbarPosition.snapped.get();
    const y = position[1] + 50 + 12;
    if (y > windowDimensions.height || snapped) {
      setToolbarPosition({
        position: [position[0], windowDimensions.height - 50 - 12],
        snapped: true,
      });
    }
  }, [windowDimensions]);

  const handler = useGesture(
    {
      onDrag: (state) => {
        setToolbarPosition({
          position: state.movement,
          snapped: state.movement[1] === windowDimensions.height - 50 - 10,
          immediate: true,
        });
      },
      onClick: () => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          return;
        }
        setShowItems((showItems) => !showItems);
      },
    },
    {
      drag: {
        initial: () => toolbarPosition.position.get(),
        bounds: {
          left: 10,
          right: windowDimensions.width - 70 - 10,
          top: 10,
          bottom: windowDimensions.height - 50 - 10,
        },
        threshold: 5,
      },
    }
  );

  // const status = useQuery<authenticatedAppShell_userStatsStatusQuery>(
    const status = useQuery<playerArea_userStatsStatusQuery>(
    UserStatsStatusQuery
  );

  React.useEffect(()=>{
    if(status.error || status.data?.userStatsStatus){
      setEditStatus(false);
    } else {
      setEditStatus(true);
    }
  },[status])
  

  console.log("player main status", status.data?.userStatsStatus)

  const noteWindowActions = useNoteWindowActions();
  return (
    <>
          {/* add bar */}
          <AppBar position="static" className={classes.appBar}>
        <Grid container alignItems="center" justify="center">
          <Grid item xl={7} lg={7} md={7} sm={7} xs={7}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabList.map((tab) => (
                <Tab
                  key={tab.key.toString()}
                  value={tab.id}
                  // label={"Node " + tab.id}
                  label={bodyComponent[tab.id]}
                  // icon={<Close id={tab.id} onClick={deleteTab}/>}
                  className="mytab"
                />
              ))}
            </Tabs>
          </Grid>
          <Grid item xl={5} lg={5} md={5} sm={5} xs={5}>
            {loggedIn ? 
            <>
              <Button variant="outlined" onClick={loadUserCharacter}>
                  <RefreshIcon style={{ color: "white" }} />
              </Button>
              <Button onClick={loadStatus}>
                  {editStatus ? <EditIcon style={{ color: "green" }} /> : <EditOffIcon style={{ color: "red" }} />}
              </Button>
              <Button variant="outlined" onClick={sendTab}>
                      <SendRoundedIcon style={{ color: "white" }} />
                    </Button>
                    <IconButton style={{height:"40px"}}
                    onClick={handleLoggedOut}
                    colorScheme='teal'
                    aria-label='Call Segun'
                    size='lg'
                    icon={<Icon.BookOpen />}
                  /></> : 
            <>
              <Stack spacing={2}>
                <InputGroup>
                  <InputLeftElement pointerEvents='none'>
                      <Avatar src='https://bit.ly/broken-link' size='sm'/>
                  </InputLeftElement>
                  <Input type='tel' placeholder='Username' width='180px' onChange={handleInputChange} value={userName}/>
                  <IconButton style={{height:"40px"}}
                    colorScheme='teal'
                    aria-label='Call Segun'
                    size='lg'
                    onClick={handleLoggedIn}
                    icon={<Icon.BookOpen />}
                  />
                </InputGroup>
                
              </Stack>
            </>}
          </Grid>
        </Grid>
      </AppBar>
      {/* end */}
      
      {tabValue===3 && <PlayerOther character={character} updateCharacter={updateCharacter}/>}

      {tabValue===2 && <PlayerSpell character={character} updateCharacter={updateCharacter}/>}
      
      {tabValue===1 && <PlayerProfile character={character} updateCharacter={updateCharacter}/>}
      
      {tabValue===0 && <>
        <div
        style={{
          cursor: "grab",
          background: "black",
          height: "100vh",
        }}
      >
        <FlatContextProvider
          value={[
            [
              MarkAreaToolContext.Provider,
              {
                value: {
                  onMarkArea: ([x, y]) => {
                    if (currentMap.data?.activeMap) {
                      mapPing({
                        variables: {
                          input: {
                            mapId: currentMap.data.activeMap.id,
                            x,
                            y,
                          },
                        },
                      });
                    }
                  },
                },
              },
            ] as ComponentWithPropsTuple<
              React.ComponentProps<typeof MarkAreaToolContext.Provider>
            >,
            [
              UpdateTokenContext.Provider,
              {
                value: (id, { x, y }) => updateToken({ id, x, y }),
              },
            ] as ComponentWithPropsTuple<
              React.ComponentProps<typeof UpdateTokenContext.Provider>
            >,
          ]}
        >

          {currentMap.data?.activeMap ? (
            <React.Suspense fallback={null}>
              <LazyLoadedMapView
                map={currentMap.data.activeMap}
                grid={currentMap.data.activeMap.grid}
                activeTool={userSelectedTool}
                controlRef={controlRef}
                sharedContexts={[
                  MarkAreaToolContext,
                  NoteWindowActionsContext,
                  ReactRelayContext,
                  UpdateTokenContext,
                ]}
                fogOpacity={1}
              />
            </React.Suspense>
          ) : null}
        </FlatContextProvider>
      </div>
      {!showSplashScreen ? (
        isMapOnly ? null : (
          <>
            <LeftToolbarContainer>
              <Toolbar>
                <Toolbar.Logo />
                <Toolbar.Group divider>
                  {playerTools.map((record) => (
                    <MenuItemRenderer
                      key={record.tool.id}
                      record={record}
                      isActive={record.tool === userSelectedTool}
                      setActiveTool={() => {
                        setActiveToolId(record.tool.id);
                      }}
                    />
                  ))}
                </Toolbar.Group>
              </Toolbar>
            </LeftToolbarContainer>
            <ToolbarContainer
              style={{
                transform: to(
                  [toolbarPosition.position],
                  ([x, y]) => `translate(${x}px, ${y}px)`
                ),
              }}
            >
              <Toolbar horizontal>
                <Toolbar.Logo {...handler()} cursor="grab" />
                {showItems ? (
                  <React.Fragment>
                    <Toolbar.Group>
                      <Toolbar.Item isActive>
                        <Toolbar.Button
                          onClick={() => {
                            controlRef.current?.controls.center();
                          }}
                          onTouchStart={(ev) => {
                            ev.preventDefault();
                            controlRef.current?.controls.center();
                          }}
                        >
                          <Icon.Compass boxSize="20px" />
                          <Icon.Label>Center Map</Icon.Label>
                        </Toolbar.Button>
                      </Toolbar.Item>
                      <Toolbar.Item isActive>
                        <Toolbar.LongPressButton
                          onClick={() => {
                            controlRef.current?.controls.zoomIn();
                          }}
                          onLongPress={() => {
                            const interval = setInterval(() => {
                              controlRef.current?.controls.zoomIn();
                            }, 100);

                            return () => clearInterval(interval);
                          }}
                        >
                          <Icon.ZoomIn boxSize="20px" />
                          <Icon.Label>Zoom In</Icon.Label>
                        </Toolbar.LongPressButton>
                      </Toolbar.Item>
                      <Toolbar.Item isActive>
                        <Toolbar.LongPressButton
                          onClick={() => {
                            controlRef.current?.controls.zoomOut();
                          }}
                          onLongPress={() => {
                            const interval = setInterval(() => {
                              controlRef.current?.controls.zoomOut();
                            }, 100);

                            return () => clearInterval(interval);
                          }}
                        >
                          <Icon.ZoomOut boxSize="20px" />
                          <Icon.Label>Zoom Out</Icon.Label>
                        </Toolbar.LongPressButton>
                      </Toolbar.Item>
                      <Toolbar.Item isActive>
                        <Toolbar.LongPressButton
                          onClick={() => {
                            noteWindowActions.showNoteInWindow(
                              null,
                              "note-editor",
                              true
                            );
                          }}
                        >
                          <Icon.BookOpen boxSize="20px" />
                          <Icon.Label>Notes</Icon.Label>
                        </Toolbar.LongPressButton>
                      </Toolbar.Item>
                    </Toolbar.Group>
                  </React.Fragment>
                ) : null}
              </Toolbar>
            </ToolbarContainer>
          </>
        )
      ) : (
        <AbsoluteFullscreenContainer>
          <SplashScreen text="Ready." />
        </AbsoluteFullscreenContainer>
      )}
      </>}
      
      
    </>
  );
};

const usePcPassword = () =>
  usePersistedState<string>("pcPassword", {
    encode: (value) => JSON.stringify(value),
    decode: (rawValue) => {
      if (typeof rawValue === "string") {
        try {
          const parsedValue = JSON.parse(rawValue);
          if (typeof parsedValue === "string") {
            return parsedValue;
          }
        } catch (e) {}
      }
      return "";
    },
  });

const AuthenticatedContent: React.FC<{
  pcPassword: string;
  localFetch: typeof fetch;
  isMapOnly: boolean;
}> = (props) => {
  const socket = useSocket();

  return (
    <AuthenticatedAppShell
      password={props.pcPassword}
      socket={socket}
      isMapOnly={props.isMapOnly}
      role="Player"
    >
      <PlayerMap
        fetch={props.localFetch}
        socket={socket}
        isMapOnly={props.isMapOnly}
      />
    </AuthenticatedAppShell>
  );
};

export const PlayerArea: React.FC<{
  password: string | null;
  isMapOnly: boolean;
}> = (props) => {
  const [pcPassword, setPcPassword] = usePcPassword();
  const initialPcPassword = React.useRef(pcPassword);
  let usedPassword = pcPassword;
  // the password in the query parameters has priority.
  if (pcPassword === initialPcPassword.current && props.password) {
    usedPassword = props.password;
  }

  const [mode, setMode] = React.useState("LOADING");

  const localFetch = React.useCallback(
    (input, init = {}) => {
      return fetch(buildApiUrl(input), {
        ...init,
        headers: {
          Authorization: usedPassword ? `Bearer ${usedPassword}` : undefined,
          ...init.headers,
        },
      }).then((res) => {
        if (res.status === 401) {
          console.error("Unauthenticated access.");
          setMode("AUTHENTICATE");
        }
        return res;
      });
    },
    [usedPassword]
  );

  useAsyncEffect(
    function* () {
      const result: any = yield localFetch("/auth").then((res) => res.json());
      if (!result.data.role) {
        setMode("AUTHENTICATE");
        return;
      }
      setMode("READY");
    },
    [localFetch]
  );

  if (mode === "LOADING") {
    return <SplashScreen text="Loading..." />;
  }

  if (mode === "AUTHENTICATE") {
    return (
      <AuthenticationScreen
        requiredRole="PC"
        fetch={localFetch}
        onAuthenticate={(password) => {
          setPcPassword(password);
        }}
      />
    );
  }

  if (mode === "READY") {
    return (
      <AuthenticatedContent
        localFetch={localFetch}
        pcPassword={usedPassword}
        isMapOnly={props.isMapOnly}
      />
    );
  }

  throw new Error("Invalid mode.");
};
