import { createSlice } from '@reduxjs/toolkit';
import filter from 'lodash/filter';
import find from 'lodash/find';
import last from 'lodash/last';
import { uuid } from 'utils/common';

const initialState = {
  tabs: [],
  activeTabUid: null
};

// Request types that should be treated as request tabs
const REQUEST_TAB_TYPES = ['http-request', 'graphql-request', 'grpc-request', 'ws-request'];

export const workspaceTabsSlice = createSlice({
  name: 'workspaceTabs',
  initialState,
  reducers: {
    addWorkspaceTab: (state, action) => {
      const { uid, workspaceUid, type, label, permanent = false } = action.payload;

      const existingTab = find(state.tabs, (tab) => tab.uid === uid);
      if (existingTab) {
        state.activeTabUid = existingTab.uid;
        return;
      }

      // Check if a tab of the same type already exists for this workspace
      const existingTypeTab = find(
        state.tabs,
        (tab) => tab.workspaceUid === workspaceUid && tab.type === type
      );
      if (existingTypeTab) {
        state.activeTabUid = existingTypeTab.uid;
        return;
      }

      state.tabs.push({
        uid,
        workspaceUid,
        type,
        label,
        permanent
      });
      state.activeTabUid = uid;
    },
    focusWorkspaceTab: (state, action) => {
      state.activeTabUid = action.payload.uid;
    },
    closeWorkspaceTab: (state, action) => {
      const tabUid = action.payload.uid;

      state.tabs = filter(state.tabs, (t) => t.uid !== tabUid);

      // If we closed the active tab, activate another one
      if (state.activeTabUid === tabUid && state.tabs.length > 0) {
        state.activeTabUid = last(state.tabs).uid;
      } else if (state.tabs.length === 0) {
        state.activeTabUid = null;
      }
    },
    closeWorkspaceTabs: (state, action) => {
      const tabUids = action.payload.tabUids || [];

      state.tabs = filter(state.tabs, (t) => !tabUids.includes(t.uid));

      // If active tab was closed, activate another one
      if (tabUids.includes(state.activeTabUid)) {
        if (state.tabs.length > 0) {
          state.activeTabUid = last(state.tabs).uid;
        } else {
          state.activeTabUid = null;
        }
      }
    },
    closeAllWorkspaceTabs: (state, action) => {
      const workspaceUid = action.payload?.workspaceUid;

      if (workspaceUid) {
        // Close all tabs for specific workspace
        state.tabs = filter(state.tabs, (t) => t.workspaceUid !== workspaceUid);
      } else {
        // Close all tabs
        state.tabs = [];
      }

      // If active tab was closed, activate another one
      const activeTabExists = find(state.tabs, (t) => t.uid === state.activeTabUid);
      if (!activeTabExists) {
        state.activeTabUid = state.tabs.length > 0 ? last(state.tabs).uid : null;
      }
    },
    reorderWorkspaceTabs: (state, action) => {
      const { sourceUid, targetUid } = action.payload;
      const tabs = state.tabs;

      const sourceIdx = tabs.findIndex((t) => t.uid === sourceUid);
      const targetIdx = tabs.findIndex((t) => t.uid === targetUid);

      if (sourceIdx < 0 || targetIdx < 0 || sourceIdx === targetIdx) {
        return;
      }

      const [moved] = tabs.splice(sourceIdx, 1);
      tabs.splice(targetIdx, 0, moved);

      state.tabs = tabs;
    },
    initializeWorkspaceTabs: (state, action) => {
      const { workspaceUid, defaultTabs } = action.payload;

      // Check if any tabs already exist for this workspace
      const existingTabs = state.tabs.filter(
        (t) => t.workspaceUid === workspaceUid
      );

      if (existingTabs.length === 0 && defaultTabs && defaultTabs.length > 0) {
        // Add default tabs (not permanent, can be closed)
        defaultTabs.forEach((tab) => {
          state.tabs.push({
            uid: `${workspaceUid}-${tab.type}`,
            workspaceUid,
            type: tab.type,
            label: tab.label
          });
        });
      }

      const workspaceActiveTab = state.tabs.find(
        (t) => t.uid === state.activeTabUid && t.workspaceUid === workspaceUid
      );

      if (!workspaceActiveTab) {
        const workspaceTabs = state.tabs.filter((t) => t.workspaceUid === workspaceUid);
        if (workspaceTabs.length > 0) {
          state.activeTabUid = workspaceTabs[0].uid;
        }
      }
    },
    setActiveWorkspaceTab: (state, action) => {
      const { workspaceUid, type } = action.payload;
      let tab = find(
        state.tabs,
        (t) => t.workspaceUid === workspaceUid && t.type === type
      );

      if (!tab) {
        const newTabUid = `${workspaceUid}-${type}`;
        const newTab = {
          uid: newTabUid,
          workspaceUid,
          type,
          label: type === 'overview' ? 'Overview' : type,
          permanent: false
        };
        state.tabs.push(newTab);
        tab = newTab;
      }

      state.activeTabUid = tab.uid;
    },
    // Add a request tab (for transient requests in virtual collection)
    addRequestTab: (state, action) => {
      const { workspaceUid, itemUid, collectionUid, type = 'http-request', label = 'Untitled' } = action.payload;

      // Check if tab for this item already exists
      const existingTab = find(state.tabs, (t) => t.itemUid === itemUid);
      if (existingTab) {
        state.activeTabUid = existingTab.uid;
        return;
      }

      const tabUid = uuid();
      state.tabs.push({
        uid: tabUid,
        workspaceUid,
        type,
        label,
        itemUid,
        collectionUid
      });
      state.activeTabUid = tabUid;
    },
    // Update request tab label (when request name changes)
    updateRequestTabLabel: (state, action) => {
      const { itemUid, label } = action.payload;
      const tab = find(state.tabs, (t) => t.itemUid === itemUid);
      if (tab) {
        tab.label = label;
      }
    }
  }
});

export const {
  addWorkspaceTab,
  focusWorkspaceTab,
  closeWorkspaceTab,
  closeWorkspaceTabs,
  closeAllWorkspaceTabs,
  reorderWorkspaceTabs,
  initializeWorkspaceTabs,
  setActiveWorkspaceTab,
  addRequestTab,
  updateRequestTabLabel
} = workspaceTabsSlice.actions;

export default workspaceTabsSlice.reducer;
