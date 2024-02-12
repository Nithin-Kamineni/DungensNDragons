import { usePersistedState } from "../../hooks/use-persisted-state";
import * as React from "react";
import useAsyncEffect from "@n1ru4l/use-async-effect";
import { SplashScreen } from "../../splash-screen";
import { AuthenticationScreen } from "../../authentication-screen";
import { buildApiUrl } from "../../public-url";
import { AppBar, Tabs, Tab, Grid, Button } from "@material-ui/core";
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/Edit';
import { makeStyles } from "@material-ui/styles";
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PlayerStats from "./playerStats";

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

  interface IHash {
    [key: number]: any;
  }

export const DisplayPlayersStats = () => {
    const classes = useStyles();
    // const history = useHistory();

    const [tabList, setTabList] = React.useState([
        {
          key: 0,
          id: 0,
        },
        {
          key: 1,
          id: 1,
        }
      ]);
    
      const [bodyComponent, setBodyComponent] = React.useState<IHash>({ 0: "Game Map", 1: "Player Stats"});
    
      const [tabValue, setTabValue] = React.useState(1);
      const handleTabChange = (_event: React.ChangeEvent<{}>, value: number) => {
        if(value===0){
            // history.push('/dm');
            window.location.replace('/dm');
        }
        setTabValue(value);
      };

    const sendTab = () => {

    };

    // if(tabValue===0){
    //     return <>fssf</>
    // }

      return <>
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
      <PlayerStats loadedMapId={""} testString="ec"/>
      </>;
  };