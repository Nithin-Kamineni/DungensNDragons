import * as React from "react";
import { Modal, ModalDialogSize } from "../../modal";
import * as Icon from "../../feather-icons";
import { useQuery } from "relay-hooks";
// import * as Button from "../../button";
import {
  Canvas,
  PointerEvent,
  useFrame,
  useLoader,
  useThree,
  ViewportData,
} from "react-three-fiber";
import { ISendRequestTask, sendRequest } from "../../http-request";
import useAsyncEffect from "@n1ru4l/use-async-effect";
import { buildApiUrl } from "../../public-url";
import { useGetIsMounted } from "../../hooks/use-get-is-mounted";``
import { useInvokeOnScrollEnd } from "../../hooks/use-invoke-on-scroll-end";
import { Checkbox, CheckboxGroup } from '@chakra-ui/react'
import styled from "@emotion/styled/macro";
import { ImageLightBoxModal } from "../../image-lightbox-modal";
import { useShareImageAction } from "../../hooks/use-share-image-action";
import { useSplashShareImageAction } from "../../hooks/use-splash-share-image-action";
import { InputGroup } from "../../input";
import { useSelectFileDialog } from "../../hooks/use-select-file-dialog";
import { useAccessToken } from "../../hooks/use-access-token";
// import { DraggableWindow } from "../../draggable-window";
import { Box, Flex, HStack, Heading, Spacer, Stack, VStack } from "@chakra-ui/react";
import { DraggableWindow, SetWidthHandler } from "../../draggable-window";
import { PrimeReactProvider } from 'primereact/api';
import { MultiSelect,MultiSelectChangeEvent } from 'primereact/multiselect';
import { Button, IconButton } from "@chakra-ui/react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Link, Container, Badge, PinInput, PinInputField } from "@chakra-ui/react";
import { ChevronRightIcon, ArrowRightIcon, SettingsIcon } from "@chakra-ui/icons";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  Input
} from '@chakra-ui/react'
// import "primeflex/primeflex.css";
// import "primereact/resources/primereact.css";
////
import {
  TokenMarkerContext,
  TokenMarkerContextProvider,
  TokenMarkerMapTool,
} from "../../map-tools/token-marker-map-tool";
import {
  ConfigureGridMapTool,
  ConfigureGridMapToolContext,
  ConfigureMapToolState,
} from "../../map-tools/configure-grid-map-tool";
import { buttonGroup, useControls, useCreateStore, LevaInputs } from "leva";
import { ThemedLevaPanel } from "../../themed-leva-panel";
////
import "primereact/resources/themes/lara-light-indigo/theme.css";

import * as io from "io-ts";
import * as E from "fp-ts/Either";
import { pipe, identity } from "fp-ts/function";
import { DragPanZoomMapTool } from "../../map-tools/drag-pan-zoom-map-tool";
import {
  MarkAreaMapTool,
  MarkAreaToolContext,
} from "../../map-tools/mark-area-map-tool";
import {
  BrushMapTool,
  BrushToolContext,
  BrushToolContextProvider,
} from "../../map-tools/brush-map-tool";
import {
  PersistedStateModel,
  usePersistedState,
} from "../../hooks/use-persisted-state";
import {
  AreaSelectContext,
  AreaSelectContextProvider,
  AreaSelectMapTool,
} from "../../map-tools/area-select-map-tool";
import { RulerMapTool } from "../../map-tools/ruler-map-tool";
import graphql from "babel-plugin-relay/macro";
import { UpdateTokenContext } from "../../update-token-context";
import { ReactRelayContext, useFragment, useMutation } from "relay-hooks";
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
import { DeleteIcon, RepeatIcon } from "@chakra-ui/icons";

const CustomizedBreadcrumbSeparator = () => {
  return <div>&gt;</div>;
};

const TokenLibraryImagesQuery:any = graphql`
query encountersLib_allTokenImagesQuery {
  allTokenImages {
    __id
    edges {
      node {
        id
        title
        url
      }
    }
  }
}`

// const GET_Image = gql`
// query getAllTokenImage {
//   allTokenImages {
//     edges {
//       node {
//         id
//         title
//         url
//       }
//     }
//   }
// }
// `;

const SplashShareImage_SplashShareImageQuery:any = graphql`
  query encountersLib_splashShareImageSharedSplashImageQuery @live {
    sharedSplashImage {
      id
      url
    }
  }
`;

const TokenMarkerSettings = (props:{setActiveToolId: any}): React.ReactElement => {
  const tokenMarkerContext = React.useContext(TokenMarkerContext);
  // const configureGridContext = React.useContext(ConfigureGridMapToolContext);
  
  const testFunc = () => {
    props.setActiveToolId('token-marker-map-tool')
    console.log("testAns:");
  }

  return (
    <>
      <Button 
      onClick={()=>{
        testFunc()
      }}
      >
      test Btn
    </Button>
    </>
  );
};

type MediaLibraryProps = {
  onClose: () => void;
  setActiveToolId: any;
  dmAreaResponse: any;
  activeMapId: string;
};

type MediaLibraryItem = {
  id: string;
  path: string;
  title: string;
};

type MediaLibraryState =
  | {
      mode: "LOADING";
      items: null;
      selectedFileId: string | null;
    }
  | {
      mode: "LOADED";
      items: Array<MediaLibraryItem>;
      selectedFileId: string | null;
    }
  | {
      mode: "LOADING_MORE";
      items: Array<MediaLibraryItem>;
      selectedFileId: string | null;
    };

type MediaLibraryAction =
  | {
      type: "LOAD_INITIAL_RESULT";
      data: {
        items: Array<MediaLibraryItem>;
      };
    }
  | {
      type: "LOAD_MORE_RESULT";
      data: {
        items: Array<MediaLibraryItem>;
      };
    }
  | {
      type: "DELETE_ITEM_DONE";
      data: {
        deletedItemId: string;
      };
    }
  | {
      type: "UPDATE_ITEM_DONE";
      data: {
        item: MediaLibraryItem;
      };
    }
  | {
      type: "CREATE_ITEM_DONE";
      data: {
        item: MediaLibraryItem;
      };
    };

const stateReducer: React.Reducer<MediaLibraryState, MediaLibraryAction> = (
  state,
  action
) => {
  switch (action.type) {
    case "LOAD_INITIAL_RESULT": {
      return {
        ...state,
        mode: "LOADED",
        items: action.data.items,
      };
    }
    case "DELETE_ITEM_DONE": {
      if (state.mode === "LOADING") return state;
      return {
        ...state,
        items: state.items.filter(
          (item) => item.id !== action.data.deletedItemId
        ),
      };
    }
    case "LOAD_MORE_RESULT": {
      if (state.mode === "LOADING") return state;
      return {
        ...state,
        mode: "LOADED",
        items: [...state.items, ...action.data.items],
      };
    }
    case "UPDATE_ITEM_DONE": {
      if (state.mode === "LOADING") return state;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.data.item.id ? action.data.item : item
        ),
      };
    }
    case "CREATE_ITEM_DONE": {
      if (state.mode === "LOADING") return state;
      return {
        ...state,
        items: [action.data.item, ...state.items],
      };
    }
  }
};

const initialState: MediaLibraryState = {
  mode: "LOADING",
  items: null,
  selectedFileId: null,
};

interface City {
  name: string;
  code: string;
}

// const encountersLib_Active_DMMap = graphql`
//   query encountersLib_activeDMMap_Query {
//     activeMap {
//       id
//       title
//       mapImageUrl
//       fogProgressImageUrl
//       fogLiveImageUrl
//       showGrid
//       showGridToPlayers
//       tokens{
//         id
//         x
//         y
//         rotation
//         radius
//         color
//         label
//         isVisibleForPlayers
//         isMovableByPlayers
//         isLocked
//         referenceId
//       }
//     }
//   }
// `;

const encountersLib_DMMap = graphql`
  query encountersLib_activeDMMap_Query($loadedMapId: ID!){
    map(id: $loadedMapId){
      id
      title
      mapImageUrl
      fogProgressImageUrl
      fogLiveImageUrl
      showGrid
      showGridToPlayers
      tokens{
        id
        x
        y
        rotation
        radius
        color
        label
        isVisibleForPlayers
        isMovableByPlayers
        isLocked
        referenceId
      }
    }
  }
`;
  

export type Dimensions = { width: number; height: number; ratio: number };

export const Encounter: React.FC<MediaLibraryProps> = ({ onClose, setActiveToolId, dmAreaResponse, activeMapId }):React.ReactElement => {

  // const map = useQuery<any>(
  //   encountersLib_Active_DMMap
  // );

  const map = useQuery<any>(
    encountersLib_DMMap,
    {
      loadedMapId: activeMapId ?? "",
    },
    {}
  );

  console.log("maps tokens now:")
  
  console.log(map)
  
  let mapid: any;
  let tokens: any;

  if(map.data?.map){
    mapid = map.data?.map.id;
    tokens = map.data?.map.tokens
  }
  
  interface IHash {
    [key: string]: number;
  }

  let labelMap:IHash = {}

  const [labelMapState, setLabelMapState] = React.useState(labelMap);

  const [processed, SetProcessed] = React.useState(0);

  React.useEffect(()=>{
    labelMap = {}
    if(tokens){
      for(let i=0;i<tokens.length;i++){
        if(!(tokens[i].label.split(' ')[0] in labelMap)){
          labelMap[tokens[i].label.split(' ')[0]]=0
        }
        labelMap[tokens[i].label.split(' ')[0]]+=1
      }
      setLabelMapState(labelMap);
      console.log("labels",labelMapState)
    }
  },[tokens])
  
  // map.
  
  

  const [state, dispatch] = React.useReducer(stateReducer, initialState);
  const getIsMounted = useGetIsMounted();
  const accessToken = useAccessToken();

  const updateToken = React.useContext(UpdateTokenContext);
  const tokenMarkerContext = React.useContext(TokenMarkerContext);

  console.log("testmap view",tokenMarkerContext.state.tempval);

  // let [x,y] = tokenMarkerContext.state.helper.coordinates.canvasToThree(
  //   tokenMarkerContext.state.helper.coordinates.imageToCanvas([1737,905]
  // ))
  // console.log(x,y)

  // console.log(
  //   tokenMarkerContext.state.helper.coordinates.imageToCanvas([290,6140])
  // )
  console.log("--------------------------------")
  
  // tokenMarkerContext.state.includeTokenText.set(true);
  // tokenMarkerContext.state.tokenRadius.set(10)
  // tokenMarkerContext.state.tokenText="Hello"

  // const data = useQuery<tokenImageCropper_TokenLibraryImagesQuery>(
  //   TokenLibraryImagesQuery
  // );

  const data = useQuery<any>(
    TokenLibraryImagesQuery
  );

  console.log("images data e:")
  console.log(data.data)

  
  let paladin: null|string = null
  if(!data.isLoading && data.error===null){
    paladin=data.data?.allTokenImages.edges[1].node.id
  }

  React.useEffect(()=>{
    console.log("came here to update token",tokenMarkerContext.state.latestTokenID)
      if(tokenMarkerContext.state.latestTokenID){
        console.log("entered...",paladin)
        updateToken(tokenMarkerContext.state.latestTokenID,{isVisibleForPlayers:true,isMovableByPlayers:true, tokenImageId:paladin})
        tokenMarkerContext.setState((state) => ({
          ...state,
          latestTokenID: null
        }))
      }
    },[tokenMarkerContext.state.latestTokenID])

  useAsyncEffect(function* (onCancel, cast) {
    const task = sendRequest({
      method: "GET",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : null,
      },
      url: buildApiUrl("/images"),
    });
    onCancel(task.abort);
    const result = yield* cast(task.done);
    if (result.type === "success") {
      const jsonResponse = JSON.parse(result.data);
      dispatch({
        type: "LOAD_INITIAL_RESULT",
        data: {
          items: jsonResponse.data.list,
        },
      });
    }
  }, []);

  const fetchMoreTask = React.useRef<ISendRequestTask | null>(null);
  React.useEffect(() => fetchMoreTask?.current?.abort, []);

  const fetchMore = React.useCallback(() => {
    if (state.mode !== "LOADED") return;
    fetchMoreTask.current?.abort();

    const task = sendRequest({
      method: "GET",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : null,
      },
      url: buildApiUrl(`/images?offset=${state.items.length}`),
    });
    fetchMoreTask.current = task;

    task.done.then((result) => {
      if (getIsMounted() === false) return;
      if (result.type === "success") {
        const jsonResponse = JSON.parse(result.data);
        dispatch({
          type: "LOAD_MORE_RESULT",
          data: {
            items: jsonResponse.data.list,
          },
        });
      }
    });
  }, [state]);

  // const onScroll = useInvokeOnScrollEnd(
  //   React.useCallback(() => {
  //     if (state.mode === "LOADED") {
  //       fetchMore();
  //     }
  //   }, [state])
  // );

  // const [reactTreeNode, showSelectFileDialog] = useSelectFileDialog(
  //   React.useCallback((file) => {
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     const task = sendRequest({
  //       url: buildApiUrl("/images"),
  //       method: "POST",
  //       body: formData,
  //       headers: {
  //         Authorization: accessToken ? `Bearer ${accessToken}` : null,
  //       },
  //     });

  //     task.done.then((response) => {
  //       if (getIsMounted() === false) return;
  //       if (response.type === "success") {
  //         const result = JSON.parse(response.data);
  //         dispatch({
  //           type: "CREATE_ITEM_DONE",
  //           data: {
  //             item: result.data.item,
  //           },
  //         });
  //       }
  //     });
  //   }, [])
  // );

  const [mode, setMode] = React.useState<"read" | "write">("read");

  let citiesString: string|null = localStorage.getItem("selectedCities")
  
  const [selectedCities, setSelectedCities] = React.useState<City[]>((JSON.parse(citiesString))||[]);
  
  const handelSelectedCities = (value: City[]) => {
    // console.log("selectedCities value",value);
    localStorage.setItem("selectedCities",JSON.stringify(value))
    setSelectedCities(value);
  }
  const breadCrums = ["Selection", "Placement", "Encounter"];

  // console.log("localstorage", JSON.parse(localStorage.getItem("selectedCities"))||[])

  const [pagesLoaded, setpagesLoaded] = React.useState(Number(localStorage.getItem("pageLoaded"))||0);

  const [breadCrumsProcess, setBreadCrumsProcess] = React.useState(breadCrums.slice(0,pagesLoaded+1))
  
  const handelPagesLoaded = (page: number) => {
    setpagesLoaded(page);
    localStorage.setItem("pageLoaded",`${page}`)
    setBreadCrumsProcess(breadCrums.slice(0,page+1))
  };

  const cities: City [] = [
        { name: 'NewYork', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];

    console.log("labels4=",cities[1].name)
    console.log("labels3",labelMapState[cities[1].name], labelMapState)

    React.useEffect(()=>{
      testFunc2();
    },[tokenMarkerContext.state.allTokenCounter])

    const testFunc = (name: string) => {
      setActiveToolId('token-marker-map-tool')
      console.log("testAns:",tokenMarkerContext.state.allTokenCounter);
      tokenMarkerContext.state.includeTokenText=true;
      tokenMarkerContext.state.tokenText=name
    }

    const testFunc2 = () => {
      setActiveToolId('drag-pan-zoom-map-tool')
      console.log("testAns2:");
    }

    const lockToken = (tokenId: string, flag: boolean) => {
      updateToken(tokenId,{isLocked:!flag})
    }

    const visibleToken = (tokenId: string, flag: boolean) => {
      updateToken(tokenId,{isVisibleForPlayers:!flag})
    }

    const movableToken = (tokenId: string, flag: boolean) => {
      updateToken(tokenId,{isMovableByPlayers:!flag})
    }

    const deleteToken = (tokenId: string) => {
      tokenMarkerContext.state.mapTokenDeleteMany({
        variables: {
          input: {
            mapId: mapid,
            tokenIds: Array.from([tokenId]),
          },
        },
      })
    }
    
  return (
    <PrimeReactProvider 
    // value={{ unstyled: true }}
    >
    <DraggableWindow
        // onMouseDown={props.focus}
        windowWidth={450}
        onKeyDown={(ev) => {
          ev.stopPropagation();
          if (ev.key !== "Escape") {
            return;
          }
        }}
        headerLeftContent={
          <>
          {/* headerLeftContent */}
          </>
        }
        headerContent={
          <>
          <HStack spacing='10px'>
            <Box>Encounters</Box>
            <IconButton size='xs' aria-label='Search database' icon={<RepeatIcon />} onClick={()=>{
              localStorage.setItem("selectedCities","[]")
              localStorage.setItem("pageLoaded","0")
              setSelectedCities([]);
              setpagesLoaded(0);
              setBreadCrumsProcess(breadCrums.slice(0,1))
            }}/>
          </HStack>
          </>
        }
        bodyContent={
          <>
          {/* breadcrums */}
          <Container style={{marginTop:"5px",marginBottom:"5px"}}>
            <Breadcrumb separator={<ChevronRightIcon color='gray.500' />}>
              {breadCrumsProcess.map((breadCrum, index) => 
              <BreadcrumbItem onClick={()=>handelPagesLoaded(index)}>
                <BreadcrumbLink>
                  {breadCrum}
                </BreadcrumbLink>
              </BreadcrumbItem>)}
            </Breadcrumb>
          </Container>
          {/* breadcrums */}

          <Box overflowY="scroll" height="100%">
          {pagesLoaded==0 && <>
            {/* {
              loading && <>Loading...</>
            }
            {
              error && <>Error...</>
            } */}
            <div className="card flex justify-content-center">
              <MultiSelect value={selectedCities} onChange={(e: MultiSelectChangeEvent) => handelSelectedCities(e.value)} options={cities} optionLabel="name" 
                  filter placeholder="Select Cities" maxSelectedLabels={3} className="w-full md:w-20rem" />
            </div>
            <br/>
            <VStack overflowY="scroll" height="100%">
              {selectedCities.length>0 && 
                <>
                {selectedCities.map((cityObj)=>
                  <Button colorScheme='teal' size='xs'>
                    {cityObj.name}
                  </Button>
                )}
                <Flex minWidth='max-content' alignItems='center' gap='2'>
                  <Box p='5'>
                    <Heading size='md'>Generate Characters</Heading>
                  </Box>
                  <Spacer />
                  <IconButton ml="-5" background='green.400' onClick={() =>handelPagesLoaded(1)} color='white' aria-label='Search database' icon={<ArrowRightIcon />} />
                </Flex>
                </>
              }

            </VStack>
          </>}
          {pagesLoaded==1 && <>
            <br/>
            <VStack overflowY="scroll" height="100%">
              <Button colorScheme='teal' size='xs' onClick={testFunc2}>
                reset
              </Button>
              {selectedCities.length>0 && 
                <>
                {selectedCities.map((cityObj)=>
                  <HStack spacing="10px">
                    <Input value={`${labelMapState[cityObj.name]||0}`} size='sm' htmlSize={1} width='auto'/>
                    <Button colorScheme='teal' size='xs' onClick={()=>{
                      testFunc(cityObj.name)
                    }}>
                      {cityObj.name}
                    </Button>
                    <Popover>
                      <PopoverTrigger>
                        <IconButton size='xs' aria-label='Search database' icon={<SettingsIcon />} />
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>Edit <b>{cityObj.name}'s</b> Token</PopoverHeader>
                          {/* <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody> */}
                        <PopoverBody>
                          <TokenMarkerSettings setActiveToolId={setActiveToolId}/>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </HStack>
                )}
                <Flex minWidth='max-content' alignItems='center' gap='2'>
                  <Box p='5'>
                    <Heading size='md'>Load Characters</Heading>
                  </Box>
                  <Spacer />
                  <IconButton ml="-5" background='green.400' onClick={() =>handelPagesLoaded(2)} color='white' aria-label='Search database' icon={<ArrowRightIcon />} />
                </Flex>
                </>
                }
            </VStack>
          </>}
          {pagesLoaded==2 && 
          <>
            <br/>
            <VStack>

              {tokens && 
                <>
                  <TableContainer overflowY="scroll" height="100%">
                  <Table size='sm'>
                    <Thead>
                      <Tr>
                        <Th>Lock</Th>
                        <Th>Visible</Th>
                        <Th>Movable</Th>
                        <Th>Label</Th>
                        <Th>Delete</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {tokens.map((token: any)=>
                        <Tr>
                          <Td>
                            <Checkbox onChange={()=>{
                              lockToken(token.id,token.isLocked)
                            }} colorScheme='red' isChecked={token.isLocked}></Checkbox>
                          </Td>
                          <Td>
                            <Checkbox onChange={()=>{
                              visibleToken(token.id,token.isVisibleForPlayers)
                            }} colorScheme='green' isChecked={token.isVisibleForPlayers}></Checkbox>
                          </Td>
                          <Td>
                            <Checkbox onChange={()=>{
                              movableToken(token.id,token.isMovableByPlayers)
                            }} colorScheme='yellow' isChecked={token.isMovableByPlayers}></Checkbox>
                          </Td>
                          <Td>
                            <Button colorScheme='teal' size='xs' onClick={()=>{
                              console.log("changing")
                              let [x,y] = tokenMarkerContext.state.helper.coordinates.canvasToThree(
                                tokenMarkerContext.state.helper.coordinates.imageToCanvas([token.x,token.x]
                              ))
                              tokenMarkerContext.state.set({
                                scale: [1, 1, 1],
                                position: [-x, -y, 0],
                              })
                            }}>
                              {token.label}
                            </Button>
                          </Td>
                          <Td>
                          <IconButton
                            colorScheme='red'
                            aria-label='Search database'
                            icon={<DeleteIcon/>}
                            onClick={()=>{
                              deleteToken(token.id)
                            }}
                          />
                          </Td>
                        </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  <br/>
                  <br/>
                </>}
                
            </VStack>
          </>}
          </Box>
          </>
        }
          


        close={onClose}
        
        options={[]}

        onDidResize={() => {
          
        }}
        sideBarContent={ null }
      />
      </PrimeReactProvider>
  );
};




const Content = styled.div`
  width: 90vw;
  height: 90vh;
  background-color: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
`;