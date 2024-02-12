import { usePersistedState } from "../../hooks/use-persisted-state";
import * as React from "react";
import useAsyncEffect from "@n1ru4l/use-async-effect";
import { SplashScreen } from "../../splash-screen";
import { AuthenticationScreen } from "../../authentication-screen";
import { buildApiUrl } from "../../public-url";
import { DisplayPlayersStats } from "./display-players-stats";

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

export const DmAreaStats = () => {
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
      return <DisplayPlayersStats/>
    }
    return null;
  };