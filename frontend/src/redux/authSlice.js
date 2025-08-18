import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    user: null,
  },
  reducers: {
    // actions
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setUser: (state, action) => {
      state.user = action.payload
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload))
      } else {
        localStorage.removeItem("user")
      }
    },
    restoreUser: (state) => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        state.user = JSON.parse(storedUser)
      }
    },
    logout: (state) => {
      state.user = null
      localStorage.removeItem("user")
    },
  },
})
export const { setLoading, setUser, restoreUser, logout } = authSlice.actions
export default authSlice.reducer
