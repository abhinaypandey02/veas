import React, { createContext, useContext, useEffect, useState } from "react";
import { useToken } from "naystack/auth/email/client";
import { useAuthQuery } from "naystack/graphql/client";
import { GetCurrentUserQuery } from "@/__generated__/graphql";
import { GET_CURRENT_USER } from "@/constants/graphql/queries";
import {
  configureRevenueCat,
  identifyRevenueCatUser,
  resetRevenueCatUser,
} from "@/services/revenuecat";

type CurrentUser = NonNullable<GetCurrentUserQuery["getCurrentUser"]>;

interface GlobalState {
  currentUser: CurrentUser | null;
}

const GlobalContext = createContext<GlobalState>({ currentUser: null });

export function useGlobalState() {
  return useContext(GlobalContext);
}

export function GlobalStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useToken();
  const [getUser] = useAuthQuery(GET_CURRENT_USER);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    configureRevenueCat();
  }, []);

  useEffect(() => {
    if (token) {
      getUser().then((result) => {
        const user = result?.data?.getCurrentUser;
        if (user) {
          setCurrentUser(user);
          identifyRevenueCatUser(user.id.toString());
        }
      });
    } else if (token === null) {
      setCurrentUser(null);
      resetRevenueCatUser();
    }
  }, [token]);

  return (
    <GlobalContext.Provider value={{ currentUser }}>
      {children}
    </GlobalContext.Provider>
  );
}
