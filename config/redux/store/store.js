import { configureStore } from "@reduxjs/toolkit";
import userStatusReducer from '../reducers/userStatusSlice.js'
const store = configureStore({
    reducer: {
        userStatus: userStatusReducer,
    }
})
export default store;