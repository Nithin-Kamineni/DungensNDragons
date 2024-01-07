import React, { useState } from "react";
import { AppBar, Tabs, Tab, Grid, Button } from "@material-ui/core";
import Add from "@material-ui/icons/Add";
import Close from "@material-ui/icons/Close";
import { makeStyles } from "@material-ui/styles";

// I was stuck at deleting Tab, however, I found this thread from Rahul-RB on git
// https://gist.github.com/Rahul-RB/273dbb24faf411fa6cc37488e1af2415
// Since I am building an app with react hook only,
// I tried converting it to React Hooks and its works like this

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

const CustomTabsHook: React.FC<CustomTabsHookProps> = () => {

  const classes = useStyles();

  const [tabList, setTabList] = useState([
    {
      key: 0,
      id: 0,
      body: "Node 0",
    },
  ]);

  const [bodyComponent, setBodyComponent] = useState<IHash>({ 0: "Node 0" });

  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (_event: React.ChangeEvent<{}>, value: number) => {
    setTabValue(value);
  };

  const addTab = () => {
    let id = tabList[tabList.length - 1].id + 1;
    setTabList([...tabList, { key: id, id: id, body: "Node " + id }]);
    setBodyComponent({ ...bodyComponent, [id]: "Node " + id });
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

  return (
    <>
      <AppBar position="static" className={classes.appBar}>
        {console.log(tabValue, "hohoh")}
        <Grid container alignItems="center" justify="center">
          <Grid item xl={11} lg={11} md={11} sm={11} xs={11}>
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
                  label={"Node " + tab.id}
                  icon={<Close id={tab.id} onClick={deleteTab}/>}
                  className="mytab"
                />
              ))}
            </Tabs>
          </Grid>
          <Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
            <Button variant="outlined" onClick={addTab}>
              <Add style={{ color: "white" }} />
            </Button>
          </Grid>
        </Grid>
      </AppBar>
      <p>{bodyComponent[tabValue]}</p>
      {/* <p>{testString}</p> */}
      <p>455555555555555</p>
    </>
  );
};

export default CustomTabsHook;