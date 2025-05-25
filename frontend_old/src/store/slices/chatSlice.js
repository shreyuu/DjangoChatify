import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (roomId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/rooms/${roomId}/get_messages/`
      );
      return response.data;
    } catch (error) {
      showErrorToast(error.response?.data?.error || "Failed to fetch messages");
      throw error;
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ roomId, content }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/rooms/${roomId}/messages/`,
        {
          content,
        }
      );
      showSuccessToast("Message sent successfully");
      return response.data;
    } catch (error) {
      showErrorToast(error.response?.data?.error || "Failed to send message");
      throw error;
    }
  }
);

export const createRoom = createAsyncThunk(
  "chat/createRoom",
  async ({ name, description }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/rooms/create_room/`,
        {
          name,
          description,
        }
      );
      showSuccessToast("Room created successfully");
      return response.data;
    } catch (error) {
      showErrorToast(error.response?.data?.error || "Failed to create room");
      throw error;
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    rooms: [],
    activeRoom: null,
    status: "idle",
    error: null,
  },
  reducers: {
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    addRoom: (state, action) => {
      state.rooms.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
      });
  },
});

export const { setActiveRoom, addMessage, clearMessages, addRoom } =
  chatSlice.actions;
export default chatSlice.reducer;
