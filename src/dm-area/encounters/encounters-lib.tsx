import * as React from "react";
import { Modal, ModalDialogSize } from "../../modal";
import * as Icon from "../../feather-icons";
// import * as Button from "../../button";
import { ISendRequestTask, sendRequest } from "../../http-request";
import useAsyncEffect from "@n1ru4l/use-async-effect";
import { buildApiUrl } from "../../public-url";
import { useGetIsMounted } from "../../hooks/use-get-is-mounted";``
import { useInvokeOnScrollEnd } from "../../hooks/use-invoke-on-scroll-end";
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

const CustomizedBreadcrumbSeparator = () => {
  return <div>&gt;</div>;
};

const TokenMarkerSettings = (): React.ReactElement => {
  const tokenMarkerContext = React.useContext(TokenMarkerContext);
  const configureGridContext = React.useContext(ConfigureGridMapToolContext);

  const updateRadiusRef = React.useRef<null | ((radius: number) => void)>(null);

  const store = useCreateStore();
  
  const [, set] = useControls(
    () => ({
      radius: {
        type: LevaInputs.NUMBER,
        label: "Size",
        value: tokenMarkerContext.state.tokenRadius.get(),
        step: 1,
        onChange: (value) => {
          tokenMarkerContext.state.tokenRadius.set(value);
        },
      },
      radiusShortcuts: buttonGroup({
        label: null,
        opts: {
          "0.25x": () => updateRadiusRef.current?.(0.25),
          "0.5x": () => updateRadiusRef.current?.(0.5),
          "1x": () => updateRadiusRef.current?.(1),
          "2x": () => updateRadiusRef.current?.(2),
          "3x": () => updateRadiusRef.current?.(3),
        },
      }),
      color: {
        type: LevaInputs.COLOR,
        label: "Color",
        value: tokenMarkerContext.state.tokenColor ?? "rgb(255, 255, 255)",
        onChange: (color: string) => {
          tokenMarkerContext.setState((state) => ({
            ...state,
            tokenColor: color,
          }));
        },
      },
      label: {
        type: LevaInputs.STRING,
        label: "Label",
        value: tokenMarkerContext.state.tokenText,
        optional: true,
        disabled: !tokenMarkerContext.state.includeTokenText,
        onChange: (tokenText, _, { initial, disabled, fromPanel }) => {
          if (initial || !fromPanel) {
            return;
          }

          tokenMarkerContext.setState((state) => ({
            ...state,
            includeTokenText: !disabled,
            tokenText: tokenText ?? state.tokenText,
          }));
        },
      },
      counter: {
        type: LevaInputs.NUMBER,
        label: "Counter",
        step: 1,
        min: 0,
        value: tokenMarkerContext.state.tokenCounter,
        optional: true,
        disabled: !tokenMarkerContext.state.includeTokenCounter,
        onChange: (tokenCounter, _, { initial, disabled, fromPanel }) => {
          if (initial || !fromPanel) {
            return;
          }

          tokenMarkerContext.setState((state) => ({
            ...state,
            includeTokenCounter: !disabled,
            tokenCounter: tokenCounter ?? state.tokenCounter,
          }));
        },
      },
    }),
    { store },
    [tokenMarkerContext.state]
  );

  React.useEffect(() => {
    updateRadiusRef.current = (factor) => {
      tokenMarkerContext.state.tokenRadius.set(
        (configureGridContext.state.columnWidth / 2) * factor * 0.9
      );
      set({
        radius: tokenMarkerContext.state.tokenRadius.get(),
      });
    };
  });

  return (
    <>
      <ThemedLevaPanel
        fill={true}
        titleBar={false}
        store={store}
        oneLineLabels
        hideCopyButton
      />
    </>
  );
};

type MediaLibraryProps = {
  onClose: () => void;
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

export const Encounter: React.FC<MediaLibraryProps> = ({ onClose }) => {
  const [state, dispatch] = React.useReducer(stateReducer, initialState);
  const getIsMounted = useGetIsMounted();
  const accessToken = useAccessToken();

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

  const onScroll = useInvokeOnScrollEnd(
    React.useCallback(() => {
      if (state.mode === "LOADED") {
        fetchMore();
      }
    }, [state])
  );

  const [reactTreeNode, showSelectFileDialog] = useSelectFileDialog(
    React.useCallback((file) => {
      const formData = new FormData();
      formData.append("file", file);

      const task = sendRequest({
        url: buildApiUrl("/images"),
        method: "POST",
        body: formData,
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : null,
        },
      });

      task.done.then((response) => {
        if (getIsMounted() === false) return;
        if (response.type === "success") {
          const result = JSON.parse(response.data);
          dispatch({
            type: "CREATE_ITEM_DONE",
            data: {
              item: result.data.item,
            },
          });
        }
      });
    }, [])
  );

  const [mode, setMode] = React.useState<"read" | "write">("read");

  const [selectedCities, setSelectedCities] = React.useState<City[]>([]);
  const breadCrums = ["Selection", "Placement", "Encounter"];

  const [breadCrumsProcess, setBreadCrumsProcess] = React.useState(breadCrums.slice(0,1))

  const [pagesLoaded, setpagesLoaded] = React.useState(0);
  const handelPagesLoaded = (page: number) => {
    setpagesLoaded(page);
    setBreadCrumsProcess(breadCrums.slice(0,page+1))
  };

  const cities: City [] = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];

    React.useEffect(()=>{
      console.log(selectedCities);
    },[selectedCities])

  return (
    <PrimeReactProvider 
    // value={{ unstyled: true }}
    >
    <DraggableWindow
        // onMouseDown={props.focus}
        windowWidth={400}
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
          Encounters
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
            <div className="card flex justify-content-center">
              <MultiSelect value={selectedCities} onChange={(e: MultiSelectChangeEvent) => setSelectedCities(e.value)} options={cities} optionLabel="name" 
                  filter placeholder="Select Cities" maxSelectedLabels={3} className="w-full md:w-20rem" />
            </div>
            <br/>
            <VStack>
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
            <VStack>
              {selectedCities.length>0 && 
                <>
                {selectedCities.map((cityObj)=>
                  <HStack spacing="10px">
                    <PinInput value="0" size='sm'>
                      <PinInputField />
                    </PinInput>
                    <Button colorScheme='teal' size='xs'>
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
                          {/* <TokenMarkerSettings/> */}
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
    // <Modal onClickOutside={onClose} onPressEscape={onClose}>
    //   <Content
    //     onClick={(ev) => ev.stopPropagation()}
    //     tabIndex={1}
    //     style={{ maxWidth: 300 }}
    //   >
    //     <Modal.Header>
    //       <Modal.Heading2>
    //         <Icon.Image boxSize="28px" /> Media Library
    //       </Modal.Heading2>
    //       <div style={{ flex: 1, textAlign: "right" }}>
    //         <Button.Tertiary
    //           tabIndex={1}
    //           style={{ marginLeft: 8 }}
    //           onClick={onClose}
    //         >
    //           Close
    //         </Button.Tertiary>
    //       </div>
    //     </Modal.Header>
    //     <Modal.Body
    //       style={{ flex: 1, overflowY: "scroll" }}
    //       onScroll={onScroll}
    //     >
          
    //     </Modal.Body>
    //     <Modal.Footer>
          
    //     </Modal.Footer>
    //     {reactTreeNode}
    //   </Content>
    // </Modal>
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