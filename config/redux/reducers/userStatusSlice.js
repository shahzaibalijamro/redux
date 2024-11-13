import { createSlice } from "@reduxjs/toolkit";

const userStatusSlice = createSlice(
    {
        name: 'userStatus',
        initialState: {
            isLoggedIn: false
        },
        reducers: {
            changeUserStatus: (state, action) => {
                state.initialState = action.payload.item
            },
        }
    }
)

export const { changeUserStatus } = userStatusSlice.actions
export default userStatusSlice.reducer