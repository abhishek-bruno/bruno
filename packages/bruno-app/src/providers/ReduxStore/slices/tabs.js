import { createSlice } from '@reduxjs/toolkit';
import filter from 'lodash/filter';
import find from 'lodash/find';
import last from 'lodash/last';

// todo: errors should be tracked in each slice and displayed as toasts

const initialState = {
  tabs: [],
  activeTabUid: null,
  activeTabUidByWorkspace: {}, // Maps workspaceUid -> activeTabUid for that workspace
  activeTabUidByCollection: {}, // Maps collectionUid -> activeTabUid for that collection
  collectionAccessHistory: [] // Stack of collectionUids in access order (most recent last)
};

const tabTypeAlreadyExists = (tabs, collectionUid, type) => {
  return find(tabs, (tab) => tab.collectionUid === collectionUid && tab.type === type);
};

/**
 * Updates collection access history by moving collectionUid to end (most recent).
 * Limits history to last 20 collections to prevent unbounded growth.
 */
const updateCollectionAccessHistory = (history, collectionUid) => {
  if (!collectionUid) return history;

  // Remove existing occurrence
  const filtered = history.filter((uid) => uid !== collectionUid);

  // Add to end (most recent)
  const updated = [...filtered, collectionUid];

  // Keep only last 20 items
  return updated.slice(-20);
};

export const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    addTab: (state, action) => {
      const { uid, collectionUid, type, requestPaneTab, preview, exampleUid, itemUid, insertFirst, workspaceUid } = action.payload;

      const nonReplaceableTabTypes = [
        'variables',
        'collection-runner',
        'environment-settings',
        'global-environment-settings',
        'workspace-overview',
        'workspace-git',
        'workspace-environments'
      ];

      const existingTab = find(state.tabs, (tab) => tab.uid === uid);
      if (existingTab) {
        state.activeTabUid = existingTab.uid;
        return;
      }

      if (nonReplaceableTabTypes.includes(type)) {
        const existingTab = tabTypeAlreadyExists(state.tabs, collectionUid, type);
        if (existingTab) {
          state.activeTabUid = existingTab.uid;
          return;
        }
      }

      // Determine the default requestPaneTab based on request type
      let defaultRequestPaneTab = 'params';
      if (type === 'grpc-request' || type === 'ws-request') {
        defaultRequestPaneTab = 'body';
      } else if (type === 'graphql-request') {
        defaultRequestPaneTab = 'query';
      }

      const lastTab = state.tabs[state.tabs.length - 1];
      if (state.tabs.length > 0 && lastTab.preview && lastTab.workspaceUid === workspaceUid) {
        state.tabs[state.tabs.length - 1] = {
          uid,
          collectionUid,
          workspaceUid,
          requestPaneWidth: null,
          requestPaneTab: requestPaneTab || defaultRequestPaneTab,
          responsePaneTab: 'response',
          responseFormat: null,
          responseViewTab: null,
          type: type || 'request',
          preview: preview !== undefined
            ? preview
            : !nonReplaceableTabTypes.includes(type),
          ...(uid ? { folderUid: uid } : {}),
          ...(exampleUid ? { exampleUid } : {}),
          ...(itemUid ? { itemUid } : {})
        };

        state.activeTabUid = uid;
        // Update per-workspace and per-collection active tab
        if (workspaceUid) {
          state.activeTabUidByWorkspace[workspaceUid] = uid;
        }
        if (collectionUid) {
          state.activeTabUidByCollection[collectionUid] = uid;
        }
        return;
      }

      const newTab = {
        uid,
        collectionUid,
        workspaceUid,
        requestPaneWidth: null,
        requestPaneTab: requestPaneTab || defaultRequestPaneTab,
        responsePaneTab: 'response',
        responsePaneScrollPosition: null,
        responseFormat: null,
        responseViewTab: null,
        type: type || 'request',
        ...(uid ? { folderUid: uid } : {}),
        preview: preview !== undefined
          ? preview
          : !nonReplaceableTabTypes.includes(type),
        ...(exampleUid ? { exampleUid } : {}),
        ...(itemUid ? { itemUid } : {})
      };

      if (insertFirst) {
        state.tabs.unshift(newTab);
      } else {
        state.tabs.push(newTab);
      }
      state.activeTabUid = uid;
      // Update per-workspace and per-collection active tab
      if (workspaceUid) {
        state.activeTabUidByWorkspace[workspaceUid] = uid;
      }
      if (collectionUid) {
        state.activeTabUidByCollection[collectionUid] = uid;
      }
      // Track collection access when adding tab
      if (collectionUid) {
        state.collectionAccessHistory = updateCollectionAccessHistory(
          state.collectionAccessHistory,
          collectionUid
        );
      }
    },
    focusTab: (state, action) => {
      const { uid } = action.payload;
      state.activeTabUid = uid;
      // Update per-workspace and per-collection active tab
      const tab = find(state.tabs, (t) => t.uid === uid);
      if (tab) {
        if (tab.workspaceUid) {
          state.activeTabUidByWorkspace[tab.workspaceUid] = uid;
        }
        if (tab.collectionUid) {
          state.activeTabUidByCollection[tab.collectionUid] = uid;
        }
      }
      // Track collection access when focusing tab
      if (tab && tab.collectionUid) {
        state.collectionAccessHistory = updateCollectionAccessHistory(
          state.collectionAccessHistory,
          tab.collectionUid
        );
      }
    },
    switchTab: (state, action) => {
      if (!state.tabs || !state.tabs.length) {
        state.activeTabUid = null;
        return;
      }

      const direction = action.payload.direction;

      const activeTabIndex = state.tabs.findIndex((t) => t.uid === state.activeTabUid);

      let toBeActivatedTabIndex = 0;

      if (direction == 'pageup') {
        toBeActivatedTabIndex = (activeTabIndex - 1 + state.tabs.length) % state.tabs.length;
      } else if (direction == 'pagedown') {
        toBeActivatedTabIndex = (activeTabIndex + 1) % state.tabs.length;
      }

      state.activeTabUid = state.tabs[toBeActivatedTabIndex].uid;
    },
    updateRequestPaneTabWidth: (state, action) => {
      const tab = find(state.tabs, (t) => t.uid === action.payload.uid);

      if (tab) {
        tab.requestPaneWidth = action.payload.requestPaneWidth;
      }
    },
    updateRequestPaneTabHeight: (state, action) => {
      const tab = find(state.tabs, (t) => t.uid === action.payload.uid);

      if (tab) {
        tab.requestPaneHeight = action.payload.requestPaneHeight;
      }
    },
    updateRequestPaneTab: (state, action) => {
      const tab = find(state.tabs, (t) => t.uid === action.payload.uid);

      if (tab) {
        tab.requestPaneTab = action.payload.requestPaneTab;
      }
    },
    updateResponsePaneTab: (state, action) => {
      const tab = find(state.tabs, (t) => t.uid === action.payload.uid);

      if (tab) {
        tab.responsePaneTab = action.payload.responsePaneTab;
      }
    },
    updateResponsePaneScrollPosition: (state, action) => {
      const tab = find(state.tabs, (t) => t.uid === action.payload.uid);

      if (tab) {
        tab.responsePaneScrollPosition = action.payload.scrollY;
      }
    },
    updateResponseFormat: (state, action) => {
      const tab = find(state.tabs, (t) => t.uid === action.payload.uid);

      if (tab) {
        tab.responseFormat = action.payload.responseFormat;
      }
    },
    updateResponseViewTab: (state, action) => {
      const tab = find(state.tabs, (t) => t.uid === action.payload.uid);

      if (tab) {
        tab.responseViewTab = action.payload.responseViewTab;
      }
    },
    closeTabs: (state, action) => {
      const activeTab = find(state.tabs, (t) => t.uid === state.activeTabUid);
      const tabUids = action.payload.tabUids || [];
      const workspaceUid = action.payload.workspaceUid;

      // remove the tabs from the state
      state.tabs = filter(state.tabs, (t) => !tabUids.includes(t.uid));

      if (activeTab && state.tabs.length) {
        const { collectionUid } = activeTab;
        const closedTabWorkspaceUid = activeTab.workspaceUid;
        const activeTabStillExists = find(state.tabs, (t) => t.uid === state.activeTabUid);

        // if the active tab no longer exists, set the active tab to the last tab in the list
        // this implies that the active tab was closed
        if (!activeTabStillExists) {
          const workspaceToUse = workspaceUid || closedTabWorkspaceUid;
          const workspaceTabs = workspaceToUse
            ? filter(state.tabs, (t) => t.workspaceUid === workspaceToUse)
            : state.tabs;

          // Check if closed tab was from virtual collection
          const isVirtualCollection = collectionUid && collectionUid.startsWith('virtual-');

          // First, try sibling tabs in same collection
          const siblingTabs = filter(workspaceTabs, (t) => t.collectionUid === collectionUid);

          if (siblingTabs && siblingTabs.length) {
            // Activate last sibling tab
            state.activeTabUid = last(siblingTabs).uid;
          } else if (isVirtualCollection) {
            // VIRTUAL WORKSPACE: No fallback, stay in empty state
            state.activeTabUid = null;
          } else {
            // REGULAR COLLECTION: Try to fallback to previously opened collection

            // Filter history to collections with open tabs in current workspace
            const collectionsWithTabs = new Set(
              workspaceTabs.map((t) => t.collectionUid)
            );

            // Find most recent collection in history (iterate backwards)
            let previousCollectionUid = null;
            for (let i = state.collectionAccessHistory.length - 1; i >= 0; i--) {
              const historyCollectionUid = state.collectionAccessHistory[i];
              if (historyCollectionUid !== collectionUid
                && collectionsWithTabs.has(historyCollectionUid)) {
                previousCollectionUid = historyCollectionUid;
                break;
              }
            }

            if (previousCollectionUid) {
              // Fallback to previously opened collection
              const previousCollectionTabs = filter(
                workspaceTabs,
                (t) => t.collectionUid === previousCollectionUid
              );

              // Try to restore last active tab in that collection
              const lastActiveTabUid = state.activeTabUidByCollection[previousCollectionUid];
              const lastActiveTab = lastActiveTabUid
                ? find(previousCollectionTabs, (t) => t.uid === lastActiveTabUid)
                : null;

              if (lastActiveTab) {
                state.activeTabUid = lastActiveTab.uid;
              } else if (previousCollectionTabs.length > 0) {
                state.activeTabUid = last(previousCollectionTabs).uid;
              } else {
                // Fallback to any workspace tab
                state.activeTabUid = workspaceTabs.length > 0 ? last(workspaceTabs).uid : null;
              }
            } else if (workspaceTabs && workspaceTabs.length) {
              // No previous collection found, use any workspace tab
              state.activeTabUid = last(workspaceTabs).uid;
            } else {
              // No tabs in workspace - show WorkspaceHome
              state.activeTabUid = null;
            }
          }

          // Update per-workspace and per-collection active tab tracking
          if (workspaceToUse && state.activeTabUid) {
            state.activeTabUidByWorkspace[workspaceToUse] = state.activeTabUid;
            const newActiveTab = find(state.tabs, (t) => t.uid === state.activeTabUid);
            if (newActiveTab && newActiveTab.collectionUid) {
              state.activeTabUidByCollection[newActiveTab.collectionUid] = state.activeTabUid;
            }
          } else if (workspaceToUse) {
            state.activeTabUidByWorkspace[workspaceToUse] = null;
          }
        }
      }

      if (!state.tabs || !state.tabs.length) {
        state.activeTabUid = null;
      }
    },
    closeAllCollectionTabs: (state, action) => {
      const collectionUid = action.payload.collectionUid;
      state.tabs = filter(state.tabs, (t) => t.collectionUid !== collectionUid);
      state.activeTabUid = null;
    },
    makeTabPermanent: (state, action) => {
      const { uid } = action.payload;
      const tab = find(state.tabs, (t) => t.uid === uid);
      if (tab) {
        tab.preview = false;
      } else {
        console.error('Tab not found!');
      }
    },
    reorderTabs: (state, action) => {
      const { direction, sourceUid, targetUid } = action.payload;
      const tabs = state.tabs;

      let sourceIdx, targetIdx;
      if (direction) {
        sourceIdx = tabs.findIndex((t) => t.uid === state.activeTabUid);
        if (sourceIdx < 0) {
          return;
        }
        targetIdx = sourceIdx + (direction === -1 ? -1 : 1);
      } else {
        sourceIdx = tabs.findIndex((t) => t.uid === sourceUid);
        targetIdx = tabs.findIndex((t) => t.uid === targetUid);
      }

      const sourceBoundary = sourceIdx < 0;
      const targetBoundary = targetIdx < 0 || targetIdx >= tabs.length;
      if (sourceBoundary || sourceIdx === targetIdx || targetBoundary) {
        return;
      }

      const [moved] = tabs.splice(sourceIdx, 1);
      tabs.splice(targetIdx, 0, moved);

      state.tabs = tabs;
    },
    triggerSaveTransientModal: (state, action) => {
      const tab = find(state.tabs, (t) => t.uid === action.payload.uid);
      if (tab) {
        tab.showSaveTransientModal = true;
      }
    },
    clearSaveTransientModal: (state, action) => {
      const tab = find(state.tabs, (t) => t.uid === action.payload.uid);
      if (tab) {
        tab.showSaveTransientModal = false;
      }
    },
    // Switch workspace context: save current workspace's activeTabUid and restore target workspace's
    switchWorkspaceContext: (state, action) => {
      const { fromWorkspaceUid, toWorkspaceUid } = action.payload;

      // Save current workspace's active tab if there is one
      if (fromWorkspaceUid && state.activeTabUid) {
        const currentTab = find(state.tabs, (t) => t.uid === state.activeTabUid);
        if (currentTab && currentTab.workspaceUid === fromWorkspaceUid) {
          state.activeTabUidByWorkspace[fromWorkspaceUid] = state.activeTabUid;
        }
      }

      // Restore target workspace's active tab if it exists
      const targetActiveTabUid = state.activeTabUidByWorkspace[toWorkspaceUid];
      if (targetActiveTabUid) {
        const targetTab = find(state.tabs, (t) => t.uid === targetActiveTabUid);
        if (targetTab) {
          state.activeTabUid = targetActiveTabUid;
          return;
        }
      }

      // If no saved active tab for target workspace, find the first tab for that workspace
      const workspaceTabs = filter(state.tabs, (t) => t.workspaceUid === toWorkspaceUid);
      if (workspaceTabs.length > 0) {
        state.activeTabUid = workspaceTabs[0].uid;
        state.activeTabUidByWorkspace[toWorkspaceUid] = workspaceTabs[0].uid;
      } else {
        // No tabs for this workspace - set activeTabUid to null so WorkspaceHome is shown
        state.activeTabUid = null;
      }
    },
    // Switch collection context: save current collection's activeTabUid and restore target collection's
    switchCollectionContext: (state, action) => {
      const { fromCollectionUid, toCollectionUid } = action.payload;

      // Save current collection's active tab if there is one
      if (fromCollectionUid && state.activeTabUid) {
        const currentTab = find(state.tabs, (t) => t.uid === state.activeTabUid);
        if (currentTab && currentTab.collectionUid === fromCollectionUid) {
          state.activeTabUidByCollection[fromCollectionUid] = state.activeTabUid;
        }
      }

      // Restore target collection's active tab if it exists
      const targetActiveTabUid = state.activeTabUidByCollection[toCollectionUid];
      if (targetActiveTabUid) {
        const targetTab = find(state.tabs, (t) => t.uid === targetActiveTabUid);
        if (targetTab) {
          state.activeTabUid = targetActiveTabUid;
          // Track collection access
          state.collectionAccessHistory = updateCollectionAccessHistory(
            state.collectionAccessHistory,
            toCollectionUid
          );
          return;
        }
      }

      // If no saved active tab for target collection, find the first tab for that collection
      const collectionTabs = filter(state.tabs, (t) => t.collectionUid === toCollectionUid);
      if (collectionTabs.length > 0) {
        state.activeTabUid = collectionTabs[0].uid;
        state.activeTabUidByCollection[toCollectionUid] = collectionTabs[0].uid;
      } else {
        // No tabs for this collection - set activeTabUid to null so WorkspaceHome is shown
        state.activeTabUid = null;
      }
      // Track collection access
      state.collectionAccessHistory = updateCollectionAccessHistory(
        state.collectionAccessHistory,
        toCollectionUid
      );
    }
  }
});

export const {
  addTab,
  focusTab,
  switchTab,
  updateRequestPaneTabWidth,
  updateRequestPaneTabHeight,
  updateRequestPaneTab,
  updateResponsePaneTab,
  updateResponsePaneScrollPosition,
  updateResponseFormat,
  updateResponseViewTab,
  closeTabs,
  closeAllCollectionTabs,
  makeTabPermanent,
  reorderTabs,
  triggerSaveTransientModal,
  clearSaveTransientModal,
  switchWorkspaceContext,
  switchCollectionContext
} = tabsSlice.actions;

export default tabsSlice.reducer;
