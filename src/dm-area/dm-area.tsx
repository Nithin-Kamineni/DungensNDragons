import "./offscreen-canvas-polyfill";
import * as React from "react";
import useAsyncEffect from "@n1ru4l/use-async-effect";
import styled from "@emotion/styled/macro";
import { Box, Center } from "@chakra-ui/react";
import { commitMutation } from "relay-runtime";
import { useQuery, useRelayEnvironment, useFragment } from "relay-hooks";
import graphql from "babel-plugin-relay/macro";
import { SelectMapModal } from "./select-map-modal";
import { ImportFileModal } from "./import-file-modal";
import { MediaLibrary } from "./media-library";
import { Encounter } from "./encounters";
import { useSocket } from "../socket";
import { buildApiUrl } from "../public-url";
import { AuthenticationScreen } from "../authentication-screen";
import { SplashScreen } from "../splash-screen";
import { FetchContext } from "./fetch-context";
import { ISendRequestTask, sendRequest } from "../http-request";
import { AuthenticatedAppShell } from "../authenticated-app-shell";
import { AccessTokenProvider } from "../hooks/use-access-token";
import { usePersistedState } from "../hooks/use-persisted-state";
import { DmMap } from "./dm-map";
import { Socket } from "socket.io-client";
import { MapTokenEntity } from "../map-typings";
import { isFileDrag } from "../hooks/use-drop-zone";
import { useNoteWindowActions } from "./token-info-aside";
import { MapControlInterface } from "../map-view";
import { useTokenImageUpload } from "./token-image-upload";
import { dmAreaTokenAddManyMutation } from "./__generated__/dmAreaTokenAddManyMutation.graphql";
import { dmArea_MapQuery } from "./__generated__/dmArea_MapQuery.graphql";
import { useGameSettings } from "../game-settings";
import PlayerProfile from "./playerProfile";
import PlayerSpell from "./playerSpell"
import EditIcon from '@mui/icons-material/Edit';

//// add tabs bar
import { AppBar, Tabs, Tab, Grid, Button } from "@material-ui/core";
// import Add from "@material-ui/icons/Add";
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Close from "@material-ui/icons/Close";
import { makeStyles } from "@material-ui/styles";
import PlayerOther from "./playerOther";
import PlayerStats from "./dm-area-stats/playerStats";
import { DnDCharacterStatsSheet, DnDCharacterProfileSheet, DnDCharacterSpellSheet, DnDCharacter } from 'dnd-character-sheets'
import EditOffIcon from '@mui/icons-material/EditOff';

import {
  PersistedStateModel
} from "../hooks/use-persisted-state";
import * as io from "io-ts";
import * as E from "fp-ts/Either";
import { pipe, identity } from "fp-ts/function";
import { DragPanZoomMapTool } from "../map-tools/drag-pan-zoom-map-tool";
import {
  MarkAreaMapTool,
  MarkAreaToolContext,
} from "../map-tools/mark-area-map-tool";
import {
  BrushMapTool,
  BrushToolContext,
  BrushToolContextProvider,
} from "../map-tools/brush-map-tool";
import {
  AreaSelectContext,
  AreaSelectContextProvider,
  AreaSelectMapTool,
} from "../map-tools/area-select-map-tool";
import {
  TokenMarkerContext,
  TokenMarkerContextProvider,
  TokenMarkerMapTool,
} from "../map-tools/token-marker-map-tool";
import { RulerMapTool } from "../map-tools/ruler-map-tool";
import { UpdateTokenContext } from "../update-token-context";

const ActiveDmMapToolModel = io.union([
  io.literal(DragPanZoomMapTool.id),
  io.literal(MarkAreaMapTool.id),
  io.literal(BrushMapTool.id),
  io.literal(AreaSelectMapTool.id),
  io.literal(MarkAreaMapTool.id),
  io.literal(TokenMarkerMapTool.id),
  io.literal(RulerMapTool.id),
]);

const activeDmMapToolIdModel: PersistedStateModel<
  io.TypeOf<typeof ActiveDmMapToolModel>
> = {
  encode: identity,
  decode: (value) =>
    pipe(
      ActiveDmMapToolModel.decode(value),
      E.fold((err) => {
        if (value !== null) {
          console.log(
            "Error occurred while trying to decode value.\n" +
              JSON.stringify(err, null, 2)
          );
        }
        return DragPanZoomMapTool.id;
      }, identity)
    ),
};

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

interface CustomTabsHookProps {
  loadedMapId: any;
  testString: string;
}
///// end


const useLoadedMapId = () =>
  usePersistedState<string | null>("loadedMapId", {
    encode: (value) => JSON.stringify(value),
    decode: (rawValue) => {
      if (typeof rawValue === "string") {
        try {
          const parsedValue = JSON.parse(rawValue);
          if (typeof parsedValue === "string") {
            return parsedValue;
          }
          // eslint-disable-next-line no-empty
        } catch (e) {}
      }

      return null;
    },
  });


  
const useDmPassword = () =>
  usePersistedState<string>("dmPassword", {
    encode: (value) => JSON.stringify(value),
    decode: (value) => {
      try {
        if (typeof value === "string") {
          const parsedValue = JSON.parse(value);
          if (typeof parsedValue === "string") {
            return parsedValue;
          }
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}
      return "";
    },
  });

type Mode =
  | {
      title: "LOADING";
      data: null;
    }
  | {
      title: "SHOW_MAP_LIBRARY";
    }
  | {
      title: "EDIT_MAP";
    }
  | {
      title: "MEDIA_LIBRARY";
    }
  | {
      title: "ENCOUNTER_LIBRARY";
    };

const createInitialMode = (): Mode => ({
  title: "LOADING",
  data: null,
});

type TokenPartial = Omit<Partial<MapTokenEntity>, "id">;

const LoadedMapDiv = styled.div`
  display: flex;
  height: 100vh;
  background-color: black;
  /* Mobile Chrome 100vh issue with address bar */
  @media screen and (max-width: 580px) and (-webkit-min-device-pixel-ratio: 0) {
    height: calc(100vh - 56px);
  }
`;

const DmAreaTokenAddManyMutation = graphql`
  mutation dmAreaTokenAddManyMutation($input: MapTokenAddManyInput!) {
    mapTokenAddMany(input: $input)
  }
`;

const DmArea_MapQuery = graphql`
  query dmArea_MapQuery($loadedMapId: ID!, $noMap: Boolean!) @live {
    map(id: $loadedMapId) @skip(if: $noMap) {
      id
      ...dmMap_DMMapFragment
    }
    activeMap {
      id
    }
  }
`;

// const DMMapFragment = graphql`
//   fragment dmMap_DMMapFragment on Map {
//     id
//     grid {
//       color
//       offsetX
//       offsetY
//       columnWidth
//       columnHeight
//     }
//     ...mapView_MapFragment
//     ...mapContextMenuRenderer_MapFragment
//     ...dmMap_GridSettingButton_MapFragment
//     ...dmMap_GridConfigurator_MapFragment
//   }
// `;

const Content = ({
  socket,
  password: dmPassword,
}: {
  socket: Socket;
  password: string;
}): React.ReactElement => {
  const gameSettings = useGameSettings();

  const refs = React.useRef({
    gameSettings,
  });

  React.useEffect(() => {
    refs.current = {
      gameSettings,
    };
  });

  const [loadedMapId, setLoadedMapId] = useLoadedMapId();

  const dmAreaResponse = useQuery<dmArea_MapQuery>(
    DmArea_MapQuery,
    {
      loadedMapId: loadedMapId ?? "",
      noMap: loadedMapId === null,
    },
    {}
  );

  React.useEffect(() => {
    if (loadedMapId === null && dmAreaResponse.data?.activeMap) {
      setLoadedMapId(dmAreaResponse.data.activeMap.id);
    }
  }, [dmAreaResponse.data?.activeMap?.id, loadedMapId]);

  // EDIT_MAP, SHOW_MAP_LIBRARY
  const [mode, setMode] = React.useState<Mode>(createInitialMode);

  const localFetch = React.useCallback(
    (input, init = {}) => {
      return fetch(buildApiUrl(input), {
        ...init,
        headers: {
          Authorization: dmPassword ? `Bearer ${dmPassword}` : undefined,
          ...init.headers,
        },
      }).then((res) => {
        if (res.status === 401) {
          console.error("Unauthenticated access.");
          throw new Error("Unauthenticated access.");
        }
        return res;
      });
    },
    [dmPassword]
  );

  const updateToken = React.useCallback(
    (id: string, updates: TokenPartial) => {
      localFetch(`/map/${loadedMapId}/token/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...updates, socketId: socket.id }),
      });
    },
    [loadedMapId, localFetch, socket.id]
  );

  const dmPasswordRef = React.useRef(dmPassword);

  React.useEffect(() => {
    dmPasswordRef.current = dmPassword;
  });

  const sendLiveMapTaskRef = React.useRef<null | ISendRequestTask>(null);
  const sendLiveMap = React.useCallback(
    async (canvas: HTMLCanvasElement) => {
      const loadedMapId = dmAreaResponse.data?.map?.id;

      if (!loadedMapId) {
        return;
      }

      if (sendLiveMapTaskRef.current) {
        sendLiveMapTaskRef.current.abort();
      }
      const blob = await new Promise<Blob>((res) => {
        canvas.toBlob((blob) => {
          res(blob!);
        });
      });

      const image = new File([blob], "fog.live.png", {
        type: "image/png",
      });

      const formData = new FormData();
      formData.append("image", image);

      const task = sendRequest({
        url: buildApiUrl(`/map/${loadedMapId}/send`),
        method: "POST",
        body: formData,
        headers: {
          Authorization: dmPassword ? `Bearer ${dmPassword}` : null,
        },
      });

      console.log('server-call start================================')

      console.log(buildApiUrl(`/map/${loadedMapId}/send`))

      console.log('server-call end================================')

      sendLiveMapTaskRef.current = task;
      const result = await task.done;
      if (result.type !== "success") {
        return;
      }
    },
    [dmAreaResponse.data?.map?.id, dmPassword]
  );

  const sendProgressFogTaskRef = React.useRef<null | ISendRequestTask>(null);
  const saveFogProgress = React.useCallback(
    async (canvas: HTMLCanvasElement) => {
      const loadedMapId = dmAreaResponse.data?.map?.id;

      if (!loadedMapId) {
        return;
      }

      console.log("running 2.....")

      console.log(loadedMapId);

      if(dmAreaResponse.data?.map != null){
        console.log(dmAreaResponse.data!.map!.id);
        console.log(dmAreaResponse.data.map)
        console.log(dmAreaResponse.data?.activeMap?.id ?? null)
      }

      console.log('-------------------2')

      if (sendLiveMapTaskRef.current) {
        sendLiveMapTaskRef.current.abort();
      }
      const blob = await new Promise<Blob>((res) => {
        canvas.toBlob((blob) => {
          res(blob!);
        });
      });

      const formData = new FormData();

      formData.append(
        "image",
        new File([blob], "fog.png", {
          type: "image/png",
        })
      );

      if (refs.current.gameSettings.value.autoSendMapUpdates) {
        //Non-blocking send in the event it fails the map will still be saved
        sendLiveMap(canvas).then(() => {});
      }

      const task = sendRequest({
        url: buildApiUrl(`/map/${loadedMapId}/fog`),
        method: "POST",
        body: formData,
        headers: {
          Authorization: dmPassword ? `Bearer ${dmPassword}` : null,
        },
      });
      sendProgressFogTaskRef.current = task;
      const result = await task.done;
      if (result.type !== "success") {
        return;
      }
    },
    [dmAreaResponse.data?.map?.id, dmPassword]
  );

  const hideMap = React.useCallback(async () => {
    await localFetch("/active-map", {
      method: "POST",
      body: JSON.stringify({
        mapId: null,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }, [localFetch]);

  const showMapModal = React.useCallback(() => {
    setMode({ title: "SHOW_MAP_LIBRARY" });
  }, []);

  const [importModalFile, setImportModalFile] = React.useState<null | File>(
    null
  );

  const actions = useNoteWindowActions();
  const controlRef = React.useRef<MapControlInterface | null>(null);

  const dragRef = React.useRef(0);
  const [isDraggingFile, setIsDraggingFile] = React.useState(false);

  const objectUrlCleanupRef = React.useRef<null | (() => void)>(null);
  React.useEffect(
    () => () => {
      objectUrlCleanupRef.current?.();
    },
    []
  );
  const [cropperNode, selectFile] = useTokenImageUpload();
  const relayEnvironment = useRelayEnvironment();


  ///// add tab bar

  const classes = useStyles();

  const [tabList, setTabList] = React.useState([
    {
      key: 0,
      id: 0,
    },
    {
      key: 1,
      id: 1,
    },
  ]);

  const [bodyComponent, setBodyComponent] = React.useState<IHash>({ 0: "Game Map", 1: "Player Stats"});

  const [tabValue, setTabValue] = React.useState(0);
  const handleTabChange = (_event: React.ChangeEvent<{}>, value: number) => {
    if(value===1){
      // history.push('/dm');
      window.location.replace('/dm-stats');
  }
    setTabValue(value);
  };

  const sendTab = () => {

  };

  const deleteTab = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    if (tabList.length === 1) {
      return;
    }
    let tabId = parseInt(e.currentTarget.id);
    let tabIDIndex = 0;

    let tabs = tabList.filter((value, index) => {
      if (value.id === tabId) {
        tabIDIndex = index;
      }
      return value.id !== tabId;
    });

    // remove tabId from hashmap
    const updatedBodyComponent = { ...bodyComponent };
    delete updatedBodyComponent[tabId];

    // let curValue = parseInt(tabValue);
    let curValue = tabValue;
    if (curValue === tabId) {
      if (tabIDIndex === 0) {
        curValue = tabList[tabIDIndex + 1].id;
      } else {
        curValue = tabList[tabIDIndex - 1].id;
      }
    }
    setTabValue(curValue);
    setTabList(tabs);
    setBodyComponent(updatedBodyComponent);
  };


  //// end bar

  const [character, setCharacter] = React.useState<DnDCharacter>(loadDefaultCharacter())

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

  const [activeToolId, setActiveToolId] = usePersistedState(
    "activeDmTool",
    activeDmMapToolIdModel
  );

  (dmAreaResponse.error === null &&
    // because it is a live query isLoading is always true
    // thanks relay :D
    // so we wanna show the map library if the data is loaded aka data is not undefined but data.map is undefined :D
    dmAreaResponse.data &&
    !dmAreaResponse.data.map)

  let map=null;
  if(dmAreaResponse.error === null &&
    // because it is a live query isLoading is always true
    // thanks relay :D
    // so we wanna show the map library if the data is loaded aka data is not undefined but data.map is undefined :D
    dmAreaResponse.data &&
    !dmAreaResponse.data.map &&
    dmAreaResponse.data.map!=undefined){
  // map = useFragment(DMMapFragment, dmAreaResponse.data.map);
  }

  const [activeMapId, setActiveMapId] = React.useState(loadedMapId);

  return (
    <FetchContext.Provider value={localFetch}>
      {/* add bar */}
      <AppBar position="static" className={classes.appBar}>
        <Grid container alignItems="center" justify="center">
          <Grid item xl={10} lg={10} md={10} sm={10} xs={10}>
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
          <Grid item xl={2} lg={2} md={2} sm={2} xs={2}>
            <Button>
            {true ? <EditIcon style={{ color: "green" }} /> : <EditOffIcon style={{ color: "red" }} />}
            </Button>
            <Button variant="outlined" onClick={sendTab}>
              <SendRoundedIcon style={{ color: "white" }} />
            </Button>
          </Grid>
        </Grid>
      </AppBar>
      {/* end */}
      {/* <p style={{backgroundColor:"black", color:"white"}}>{bodyComponent[tabValue]}</p> */}
  
      {tabValue===5 && <PlayerOther character={character}/>}

      {tabValue===4 && <PlayerSpell character={character}/>}
      
      {tabValue===3 && <PlayerProfile character={character}/>}
      
      {tabValue===2 && <PlayerSpell character={character}/>}
      
      {tabValue===1 && <PlayerStats loadedMapId={""} testString="ec"/>}

      {tabValue===0 && (<>
        {(dmAreaResponse.error === null &&
        // because it is a live query isLoading is always true
        // thanks relay :D
        // so we wanna show the map library if the data is loaded aka data is not undefined but data.map is undefined :D
        dmAreaResponse.data &&
        !dmAreaResponse.data.map) ||
      mode.title === "SHOW_MAP_LIBRARY" ? 
      (
          <SelectMapModal
            canClose={dmAreaResponse.data?.map !== null}
            loadedMapId={loadedMapId}
            liveMapId={dmAreaResponse.data?.map?.id ?? null}
            closeModal={() => {
              setMode({ title: "EDIT_MAP" });
            }}
            setLoadedMapId={(loadedMapId) => {
              setMode({ title: "EDIT_MAP" });
              setLoadedMapId(loadedMapId);
            }}
            activeMapId={activeMapId}
            setActiveMapId={setActiveMapId}
          />
      ) : null}
      {mode.title === "MEDIA_LIBRARY" ? (
        <MediaLibrary
          onClose={() => {
            setMode({ title: "EDIT_MAP" });
          }}
        />
      ) : null}
      {/* {mode.title === "ENCOUNTER_LIBRARY" ? (
        <Encounter
          onClose={() => {
            setMode({ title: "EDIT_MAP" });
          }}
          setActiveToolId={setActiveToolId}
        />
      ) : null} */}

      {dmAreaResponse.data?.map != null ? (
        <>
          <TokenMarkerContextProvider currentMapId={dmAreaResponse.data.map?.id}>
            <UpdateTokenContext.Provider value={updateToken}>
          {mode.title === "ENCOUNTER_LIBRARY" ? (
          <Encounter
            onClose={() => {
              setMode({ title: "EDIT_MAP" });
            }}
            setActiveToolId={setActiveToolId}
            dmAreaResponse={dmAreaResponse}
            activeMapId={activeMapId}
          />
          ) : null}
            <LoadedMapDiv
              onDragEnter={(ev) => {
                if (isFileDrag(ev) === false) {
                  return;
                }
                ev.dataTransfer.dropEffect = "copy";
                dragRef.current++;                                   // scale create based on number of tabs 1
                setIsDraggingFile(dragRef.current !== 0);            // scale create based on number of tabs 1
                ev.preventDefault();
              }}
              onDragLeave={(ev) => {
                if (isFileDrag(ev) === false) {
                  return;
                }
                dragRef.current--;
                setIsDraggingFile(dragRef.current !== 0);
                ev.preventDefault();
              }}
              onDragOver={(ev) => {
                if (isFileDrag(ev) === false) {
                  return;
                }
                ev.preventDefault();
              }}
              onDrop={(ev) => {
                ev.preventDefault();
                if (isFileDrag(ev) === false) {
                  return;
                }
                dragRef.current = 0;
                setIsDraggingFile(dragRef.current !== 0);

                const [file] = Array.from(ev.dataTransfer.files);

                if (!file?.type.match(/image/)) {
                  return;
                }
                const context = controlRef.current?.getContext();   // scale by understanding

                if (!context) {
                  return;
                }
                const coords = context.helper.coordinates.screenToImage([
                  ev.clientX,
                  ev.clientY,
                ]);

                const addTokenWithImageId = (tokenImageId: string) => {
                  commitMutation<dmAreaTokenAddManyMutation>(relayEnvironment, {
                    mutation: DmAreaTokenAddManyMutation,
                    variables: {
                      input: {
                        mapId: dmAreaResponse.data!.map!.id,
                        tokens: [
                          {
                            color: "red",
                            x: coords[0],
                            y: coords[1],
                            rotation: 0,
                            isVisibleForPlayers: false,
                            isMovableByPlayers: false,
                            isLocked: false,
                            tokenImageId,
                            label: "",
                          },
                        ],
                      },
                    },
                  });
                };

                selectFile(file, [], ({ tokenImageId }) => {
                  addTokenWithImageId(tokenImageId);
                });
              }}
            >
            {cropperNode}
            {isDraggingFile ? (
              <Center
                position="absolute"
                top="0"
                width="100%"
                zIndex={99999999}
                justifyContent="center"
              >
                <DropZone
                  onDragEnter={(ev) => {
                    if (isFileDrag(ev) === false) {
                      return;
                    }
                    ev.dataTransfer.dropEffect = "copy";
                    dragRef.current++;
                    setIsDraggingFile(dragRef.current !== 0);
                    ev.preventDefault();
                  }}
                  onDragLeave={(ev) => {
                    if (isFileDrag(ev) === false) {
                      return;
                    }
                    dragRef.current--;
                    setIsDraggingFile(dragRef.current !== 0);
                    ev.preventDefault();
                  }}
                  onDragOver={(ev) => {
                    if (isFileDrag(ev) === false) {
                      return;
                    }
                    ev.preventDefault();
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    if (isFileDrag(ev) === false) {
                      return;
                    }

                    dragRef.current = 0;
                    setIsDraggingFile(dragRef.current !== 0);

                    ev.stopPropagation();
                    const [file] = Array.from(ev.dataTransfer.files);
                    if (file) {
                      setImportModalFile(file);
                    }
                  }}
                >
                  Import Map or Media Library Item
                </DropZone>
              </Center>
            ) : null}
            {/* </LoadedMapDiv> */}
            <div
              style={{
                flex: 1,
                // position: "relative",
                overflow: "hidden",
              }}
            >
              <DmMap
                controlRef={controlRef}
                password={dmPassword}
                map={dmAreaResponse.data.map}
                liveMapId={dmAreaResponse.data?.activeMap?.id ?? null}
                sendLiveMap={sendLiveMap}
                saveFogProgress={saveFogProgress}
                hideMap={hideMap}
                showMapModal={showMapModal}
                activeToolId={activeToolId}
                setActiveToolId={setActiveToolId}
                openNotes={() => {
                  actions.showNoteInWindow(null, "note-editor", true);
                }}
                openEncounters={() => {
                  // actions.showEncounterInWindow(null, "note-editor", true);
                  setMode({ title: "ENCOUNTER_LIBRARY" });
                }}
                openMediaLibrary={() => {
                  setMode({ title: "MEDIA_LIBRARY" });
                }}
                updateToken={updateToken}

                // modetitle={mode.title}
                onClose={() => {
                  setMode({ title: "EDIT_MAP" });
                }}
              />
            </div>
            </LoadedMapDiv>
            </UpdateTokenContext.Provider>
          </TokenMarkerContextProvider>
        </>
      ) : null}
      
      {importModalFile ? (
        <ImportFileModal
          file={importModalFile}
          close={() => setImportModalFile(null)}
        />
      ) : null}
      </>)}
      
    </FetchContext.Provider>
  );
};

import { getUrlPrefix, buildUrl } from "../public-url";
import { DmAreaStats } from "./dm-area-stats/dm-area-stats"
const DmAreaRenderer = ({
  password,
}: {
  password: string;
}): React.ReactElement => {
  const socket = useSocket();
  let component = null;
  const pathname = window.location.pathname.replace(getUrlPrefix(), "");
  if(pathname=="/dm"){
    component = <Content socket={socket} password={password} />
  } else {
      component = <DmAreaStats />;
  }

  return (
    <AccessTokenProvider value={password}>
      <AuthenticatedAppShell
        socket={socket}
        password={password}
        isMapOnly={false}
        role="DM"
      >
        {/* <Content socket={socket} password={password} /> */}
        {component}
      </AuthenticatedAppShell>
    </AccessTokenProvider>
  );
};

export const DmArea = () => {
  const [dmPassword, setDmPassword] = useDmPassword();
  // "authenticate" | "authenticated"
  const [mode, setMode] = React.useState("loading");

  const localFetch = React.useCallback(
    async (input, init = {}) => {
      const res = await fetch(buildApiUrl(input), {
        ...init,
        headers: {
          Authorization: dmPassword ? `Bearer ${dmPassword}` : undefined,
          ...init.headers,
        },
      });
      if (res.status === 401) {
        console.error("Unauthenticated access.");
        throw new Error("Unauthenticated access.");
      }
      return res;
    },
    [dmPassword]
  );

  useAsyncEffect(
    function* (_, c) {
      const result: { data: { role: string } } = yield* c(
        localFetch("/auth").then((res) => res.json())
      );
      if (!result.data.role || result.data.role !== "DM") {
        setMode("authenticate");
        return;
      }
      setMode("authenticated");
    },
    [localFetch]
  );

  if (mode === "loading") {
    return <SplashScreen text="Loading...." />;
  } else if (mode === "authenticate") {
    return (
      <AuthenticationScreen
        onAuthenticate={(password) => {
          setDmPassword(password);
          setMode("authenticated");
        }}
        fetch={localFetch}
        requiredRole="DM"
      />
    );
  } else if (mode === "authenticated") {
    return <DmAreaRenderer password={dmPassword} />;
  }
  return null;
};

type DropZoneProps = {
  children: React.ReactNode;
} & Pick<
  React.ComponentProps<typeof Box>,
  "onDragEnter" | "onDragOver" | "onDragLeave" | "onDrop"
>;

const DropZone = (props: DropZoneProps): React.ReactElement => {
  return (
    <Box
      padding="2"
      background="white"
      borderRadius="10px"
      outline="2px dashed black"
      outlineOffset="-10px"
      onDragEnter={props.onDragEnter}
      onDragOver={props.onDragOver}
      onDragLeave={props.onDragLeave}
      onDrop={props.onDrop}
    >
      <Box padding="2">{props.children}</Box>
    </Box>
  );
};
