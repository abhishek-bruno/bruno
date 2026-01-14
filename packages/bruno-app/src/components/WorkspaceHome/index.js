import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconPlus, IconFolder, IconDownload, IconFolderPlus, IconHome, IconWorld } from '@tabler/icons';
import { newStandaloneTransientRequest } from 'providers/ReduxStore/slices/collections/actions';
import { importCollection, openCollection } from 'providers/ReduxStore/slices/collections/actions';
import { createOrGetVirtualCollection } from 'providers/ReduxStore/slices/collections';
import { addTab } from 'providers/ReduxStore/slices/tabs';
import toast from 'react-hot-toast';
import CreateCollection from 'components/Sidebar/CreateCollection';
import ImportCollection from 'components/Sidebar/ImportCollection';
import ImportCollectionLocation from 'components/Sidebar/ImportCollectionLocation';
import StyledWrapper from './StyledWrapper';
import Dropdown from 'components/Dropdown';
import { getRevealInFolderLabel } from 'utils/common/platform';
import { getWorkspaceDisplayName } from 'components/AppTitleBar';
import classNames from 'classnames';

/**
 * WorkspaceHome is shown as an empty state when no tabs are open.
 * It displays a VS Code-style empty state with quick actions.
 */
const WorkspaceHome = () => {
  const dispatch = useDispatch();
  const { workspaces, activeWorkspaceUid } = useSelector((state) => state.workspaces);
  const activeWorkspace = workspaces.find((w) => w.uid === activeWorkspaceUid);

  const [createCollectionModalOpen, setCreateCollectionModalOpen] = useState(false);
  const [importCollectionModalOpen, setImportCollectionModalOpen] = useState(false);
  const [importCollectionLocationModalOpen, setImportCollectionLocationModalOpen] = useState(false);
  const [importData, setImportData] = useState(null);

  if (!activeWorkspace) {
    return (
      <StyledWrapper className="h-full flex items-center justify-center">
        <p className="text-muted">No workspace selected</p>
      </StyledWrapper>
    );
  }

  const handleNewRequest = () => {
    if (activeWorkspaceUid) {
      dispatch(newStandaloneTransientRequest({ workspaceUid: activeWorkspaceUid }));
    }
  };

  const handleOpenOverview = () => {
    if (activeWorkspaceUid && activeWorkspace) {
      const virtualCollectionUid = `virtual-${activeWorkspaceUid}`;
      dispatch(createOrGetVirtualCollection({ workspaceUid: activeWorkspaceUid, workspaceName: activeWorkspace.name }));
      dispatch(addTab({
        uid: `${virtualCollectionUid}-overview`,
        collectionUid: virtualCollectionUid,
        type: 'workspace-overview',
        workspaceUid: activeWorkspaceUid
      }));
    }
  };

  const handleOpenGlobalEnvironments = () => {
    if (activeWorkspaceUid && activeWorkspace) {
      const virtualCollectionUid = `virtual-${activeWorkspaceUid}`;
      dispatch(createOrGetVirtualCollection({ workspaceUid: activeWorkspaceUid, workspaceName: activeWorkspace.name }));
      dispatch(addTab({
        uid: `${virtualCollectionUid}-environments`,
        collectionUid: virtualCollectionUid,
        type: 'workspace-environments',
        workspaceUid: activeWorkspaceUid
      }));
    }
  };

  const handleCreateCollection = async () => {
    if (!activeWorkspace?.pathname) {
      toast.error('Workspace path not found');
      return;
    }

    try {
      const { ipcRenderer } = window;
      await ipcRenderer.invoke('renderer:ensure-collections-folder', activeWorkspace.pathname);
      setCreateCollectionModalOpen(true);
    } catch (error) {
      console.error('Error ensuring collections folder exists:', error);
      toast.error('Error preparing workspace for collection creation');
    }
  };

  const handleOpenCollection = () => {
    dispatch(openCollection()).catch((err) => {
      console.error(err);
      toast.error('An error occurred while opening the collection');
    });
  };

  const handleImportCollection = () => {
    setImportCollectionModalOpen(true);
  };

  const handleImportCollectionSubmit = ({ rawData, type }) => {
    setImportCollectionModalOpen(false);
    setImportData({ rawData, type });
    setImportCollectionLocationModalOpen(true);
  };

  const handleImportCollectionLocation = (convertedCollection, collectionLocation, options = {}) => {
    dispatch(importCollection(convertedCollection, collectionLocation, options))
      .then(() => {
        setImportCollectionLocationModalOpen(false);
        setImportData(null);
        toast.success('Collection imported successfully');
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
      });
  };

  return (
    <StyledWrapper className="h-full">
      {createCollectionModalOpen && (
        <CreateCollection onClose={() => setCreateCollectionModalOpen(false)} />
      )}

      {importCollectionModalOpen && (
        <ImportCollection
          onClose={() => setImportCollectionModalOpen(false)}
          handleSubmit={handleImportCollectionSubmit}
        />
      )}

      {importCollectionLocationModalOpen && importData && (
        <ImportCollectionLocation
          rawData={importData.rawData}
          format={importData.type}
          onClose={() => setImportCollectionLocationModalOpen(false)}
          handleSubmit={handleImportCollectionLocation}
        />
      )}

      <div className="empty-state">
        <div className="empty-state-content">
          <h2 className="empty-state-title">{activeWorkspace.name}</h2>
          <p className="empty-state-subtitle">Get started by creating a new request or opening a collection</p>

          <div className="empty-state-sections">
            <div className="empty-state-section">
              <div className="section-title">Workspace</div>
              <div className="section-actions">
                <button className="empty-state-btn" onClick={handleOpenOverview}>
                  <IconHome size={16} strokeWidth={1.5} />
                  <span>Overview</span>
                </button>
                <button className="empty-state-btn" onClick={handleOpenGlobalEnvironments}>
                  <IconWorld size={16} strokeWidth={1.5} />
                  <span>Global Environments</span>
                </button>
              </div>
            </div>

            <div className="empty-state-section">
              <div className="section-title">Quick Actions</div>
              <div className="section-actions">
                <button className="empty-state-btn" onClick={handleNewRequest}>
                  <IconPlus size={16} strokeWidth={1.5} />
                  <span>New Request</span>
                </button>
                <button className="empty-state-btn" onClick={handleCreateCollection}>
                  <IconFolderPlus size={16} strokeWidth={1.5} />
                  <span>New Collection</span>
                </button>
                <button className="empty-state-btn" onClick={handleOpenCollection}>
                  <IconFolder size={16} strokeWidth={1.5} />
                  <span>Open Collection</span>
                </button>
                <button className="empty-state-btn" onClick={handleImportCollection}>
                  <IconDownload size={16} strokeWidth={1.5} />
                  <span>Import Collection</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default WorkspaceHome;
