import { configureStore } from "@reduxjs/toolkit"
import appReducer from "./appSlice"
import dataReducer from "./dataSlice"

export function makeStore() {
  return configureStore({
    reducer: {
      app: appReducer,
      data: dataReducer,
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
