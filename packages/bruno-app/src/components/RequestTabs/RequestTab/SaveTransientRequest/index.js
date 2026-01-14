import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import Modal from 'components/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { saveTransientRequest, newFolder } from 'providers/ReduxStore/slices/collections/actions';
import { validateName, validateNameError, sanitizeName } from 'utils/common/regex';
import { IconFolder, IconFolderPlus, IconFilter, IconChevronRight, IconX, IconCheck, IconBooks } from '@tabler/icons';
import Button from 'ui/Button';
import StyledWrapper from './StyledWrapper';

const SaveTransientRequest = ({ item, collection: defaultCollection, onClose }) => {
  const dispatch = useDispatch();
  const inputRef = useRef();
  const newFolderInputRef = useRef();
  const collections = useSelector((state) => state.collections.collections);
  const { activeWorkspaceUid, workspaces } = useSelector((state) => state.workspaces);

  // Get the active workspace
  const activeWorkspace = useMemo(() => {
    return workspaces.find((w) => w.uid === activeWorkspaceUid);
  }, [workspaces, activeWorkspaceUid]);

  // Filter collections to Exclude virtual collections (workspace home)
  const availableCollections = useMemo(() => {
    if (!activeWorkspace) return [];

    // Get collection paths from the active workspace and normalize them
    const workspaceCollectionPaths = new Set(
      (activeWorkspace.collections || []).map((c) => c.path)
    );

    return collections.filter((col) => {
      // Exclude virtual collections
      if (col.virtual === true) return false;

      // Only show collections that belong to the active workspace
      // Match by pathname since workspace collections store path
      if (!workspaceCollectionPaths.has(col.pathname)) return false;

      return true;
    });
  }, [collections, activeWorkspace]);

  // Navigation state - store UIDs and derive objects from Redux to stay in sync
  const [selectedCollectionUid, setSelectedCollectionUid] = useState(
    defaultCollection?.virtual ? null : defaultCollection?.uid
  );
  const [navigationPathUids, setNavigationPathUids] = useState([]); // Array of folder UIDs
  const [loadingCollectionStructure, setLoadingCollectionStructure] = useState(false);

  // Derive selectedCollection from Redux to get fresh data when folders are created
  const selectedCollection = useMemo(() => {
    if (!selectedCollectionUid) return null;
    return collections.find((c) => c.uid === selectedCollectionUid);
  }, [collections, selectedCollectionUid]);

  // Load collection structure if items are empty (for unmounted collections)
  useEffect(() => {
    if (!selectedCollection) return;
    if (!selectedCollection.items || selectedCollection.items.length > 0) return;
    if (loadingCollectionStructure) return;

    const loadStructure = async () => {
      setLoadingCollectionStructure(true);
      try {
        const { ipcRenderer } = window;
        // Mount collection to load its structure
        await ipcRenderer.invoke('renderer:mount-collection', {
          collectionUid: selectedCollection.uid,
          collectionPathname: selectedCollection.pathname,
          brunoConfig: selectedCollection.brunoConfig
        });
      } catch (error) {
        console.error('Failed to load collection structure:', error);
        toast.error('Failed to load collection folders');
      } finally {
        setLoadingCollectionStructure(false);
      }
    };

    loadStructure();
  }, [selectedCollectionUid]);

  // Derive navigationPath from UIDs by looking up in current collection
  const navigationPath = useMemo(() => {
    if (!selectedCollection || navigationPathUids.length === 0) return [];

    const path = [];
    let currentItems = selectedCollection.items || [];

    for (const uid of navigationPathUids) {
      const folder = currentItems.find((item) => item.uid === uid && item.type === 'folder');
      if (folder) {
        path.push(folder);
        currentItems = folder.items || [];
      } else {
        // Folder not found - this shouldn't happen, but handle gracefully
        break;
      }
    }
    return path;
  }, [selectedCollection, navigationPathUids]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderError, setNewFolderError] = useState('');

  // Current folder items based on navigation
  const currentItems = useMemo(() => {
    if (!selectedCollection) return [];
    if (navigationPath.length === 0) {
      return selectedCollection.items || [];
    }
    const currentFolder = navigationPath[navigationPath.length - 1];
    return currentFolder.items || [];
  }, [selectedCollection, navigationPath]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return currentItems;
    const lowerQuery = searchQuery.toLowerCase();
    return currentItems.filter((item) => item.name.toLowerCase().includes(lowerQuery));
  }, [currentItems, searchQuery]);

  // Get folders from filtered items
  const folderItems = useMemo(() => {
    return filteredItems.filter((item) => item.type === 'folder');
  }, [filteredItems]);

  // Get request items from filtered items (for display only, disabled)
  const requestItems = useMemo(() => {
    return filteredItems.filter((item) => item.type !== 'folder');
  }, [filteredItems]);

  // Current folder UID for saving
  const currentFolderUid = useMemo(() => {
    if (navigationPath.length === 0) return null;
    return navigationPath[navigationPath.length - 1].uid;
  }, [navigationPath]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  useEffect(() => {
    if (isCreatingFolder && newFolderInputRef.current) {
      newFolderInputRef.current.focus();
    }
  }, [isCreatingFolder]);

  // Navigate into a folder
  const navigateIntoFolder = (folder) => {
    setNavigationPathUids([...navigationPathUids, folder.uid]);
    setSearchQuery('');
  };

  // Navigate to a specific point in breadcrumb
  const navigateToBreadcrumb = (index) => {
    if (index === -1) {
      // Go back to collection list
      setSelectedCollectionUid(null);
      setNavigationPathUids([]);
    } else if (index === 0) {
      // Go to collection root
      setNavigationPathUids([]);
    } else {
      // Go to specific folder
      setNavigationPathUids(navigationPathUids.slice(0, index));
    }
    setSearchQuery('');
  };

  // Select a collection
  const selectCollection = (col) => {
    setSelectedCollectionUid(col.uid);
    setNavigationPathUids([]);
    setSearchQuery('');
  };

  const handleCreateFolder = async () => {
    const trimmedName = newFolderName.trim();
    if (!trimmedName) {
      setNewFolderError('Folder name is required');
      return;
    }

    if (!validateName(trimmedName)) {
      setNewFolderError(validateNameError(trimmedName));
      return;
    }

    try {
      await dispatch(newFolder(trimmedName, sanitizeName(trimmedName), selectedCollection.uid, currentFolderUid));
      toast.success('Folder created!');
      setNewFolderName('');
      setIsCreatingFolder(false);
      setNewFolderError('');
    } catch (err) {
      setNewFolderError(err?.message || 'Failed to create folder');
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      requestName: item?.name || 'Untitled'
    },
    validationSchema: Yup.object({
      requestName: Yup.string()
        .trim()
        .min(1, 'must be at least 1 character')
        .max(255, 'must be 255 characters or less')
        .required('name is required')
        .test('is-valid-filename', function (value) {
          const isValid = validateName(value);
          return isValid ? true : this.createError({ message: validateNameError(value) });
        })
        .test(
          'not-reserved',
          `The file names "collection" and "folder" are reserved in bruno`,
          (value) => !['collection', 'folder'].includes(value?.toLowerCase())
        )
    }),
    onSubmit: (values) => {
      if (!selectedCollection) {
        toast.error('Please select a collection');
        return;
      }

      dispatch(
        saveTransientRequest({
          itemUid: item.uid,
          originalCollectionUid: defaultCollection.uid,
          targetCollectionUid: selectedCollection.uid,
          itemName: values.requestName,
          itemUidToSaveUnder: currentFolderUid
        })
      )
        .then(() => {
          toast.success('Request saved to collection');
          onClose();
        })
        .catch((err) => {
          toast.error(err?.message || 'Failed to save request');
        });
    }
  });

  // Render breadcrumb
  const renderBreadcrumb = () => {
    if (!selectedCollection) {
      return (
        <div className="breadcrumb">
          <span className="breadcrumb-label">Save to</span>
          <span className="breadcrumb-muted">Select a collection</span>
        </div>
      );
    }

    return (
      <div className="breadcrumb">
        <span className="breadcrumb-label">Save to</span>
        <span className="breadcrumb-item clickable" onClick={() => navigateToBreadcrumb(-1)}>
          Collections
        </span>
        <IconChevronRight size={12} className="breadcrumb-separator" />
        <span
          className={`breadcrumb-item ${navigationPath.length === 0 ? 'current' : 'clickable'}`}
          onClick={() => navigationPath.length > 0 && navigateToBreadcrumb(0)}
        >
          {selectedCollection.name}
        </span>
        {navigationPath.map((folder, index) => (
          <React.Fragment key={folder.uid}>
            <IconChevronRight size={12} className="breadcrumb-separator" />
            <span
              className={`breadcrumb-item ${index === navigationPath.length - 1 ? 'current' : 'clickable'}`}
              onClick={() => index < navigationPath.length - 1 && navigateToBreadcrumb(index + 1)}
            >
              {folder.name}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <StyledWrapper>
      <Modal
        size="md"
        title="Save to Collection"
        handleCancel={onClose}
        hideFooter={true}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          {/* Request Name Input */}
          <div>
            <label htmlFor="requestName" className="block mb-2">
              Request Name
            </label>
            <input
              id="requestName"
              type="text"
              name="requestName"
              ref={inputRef}
              className="block textbox w-full"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              onChange={formik.handleChange}
              value={formik.values.requestName}
            />
            {formik.touched.requestName && formik.errors.requestName ? (
              <div className="text-red-500 mt-1 text-sm">{formik.errors.requestName}</div>
            ) : null}
          </div>

          {/* Location Selector */}
          <div className="mt-3">
            {/* Breadcrumb */}
            {renderBreadcrumb()}

            {/* Search Box */}
            <div className="search-box">
              <IconFilter size={14} className="search-icon" />
              <input
                type="text"
                placeholder={selectedCollection ? 'Search for folder' : 'Search for collection'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Item List */}
            <div className="folder-list">
              {!selectedCollection ? (
                // Show collections list (filtered to exclude virtual collections and workspace-filtered)
                <>
                  {availableCollections
                    .filter((col) => !searchQuery || col.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((col) => (
                      <div key={col.uid} className="folder-item" onClick={() => selectCollection(col)}>
                        <IconBooks size={16} className="folder-icon collection-icon" />
                        <span className="folder-name">{col.name}</span>
                        <IconChevronRight size={14} className="chevron-icon" />
                      </div>
                    ))}
                  {availableCollections.length === 0 && (
                    <div className="empty-state">No collections found in this workspace</div>
                  )}
                </>
              ) : loadingCollectionStructure ? (
                // Show loading indicator while collection structure is being loaded
                <div className="empty-state">Loading folders...</div>
              ) : (
                // Show folders and requests in current location
                <>
                  {folderItems.map((folder) => (
                    <div key={folder.uid} className="folder-item" onClick={() => navigateIntoFolder(folder)}>
                      <IconFolder size={16} className="folder-icon" />
                      <span className="folder-name">{folder.name}</span>
                      <IconChevronRight size={14} className="chevron-icon" />
                    </div>
                  ))}

                  {/* Show request items in disabled state */}
                  {requestItems.map((req) => {
                    const method = req.request?.method || 'GET';
                    const methodClass = `method-${method.toLowerCase()}`;
                    return (
                      <div key={req.uid} className="request-item disabled">
                        <span className={`request-method ${methodClass}`}>{method}</span>
                        <span className="request-name">{req.name}</span>
                      </div>
                    );
                  })}

                  {/* Create New Folder */}
                  {isCreatingFolder ? (
                    <div className="create-folder-row">
                      <IconFolderPlus size={16} className="folder-icon new-folder-icon" />
                      <input
                        ref={newFolderInputRef}
                        type="text"
                        placeholder="New folder name"
                        value={newFolderName}
                        onChange={(e) => {
                          setNewFolderName(e.target.value);
                          setNewFolderError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateFolder();
                          } else if (e.key === 'Escape') {
                            setIsCreatingFolder(false);
                            setNewFolderName('');
                            setNewFolderError('');
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={handleCreateFolder}
                        disabled={!newFolderName.trim()}
                      >
                        <IconCheck size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-icon-muted"
                        onClick={() => {
                          setIsCreatingFolder(false);
                          setNewFolderName('');
                          setNewFolderError('');
                        }}
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                  ) : null}

                  {folderItems.length === 0 && requestItems.length === 0 && !isCreatingFolder && (
                    <div className="empty-state">This folder is empty</div>
                  )}

                  {newFolderError && <div className="text-red-500 text-sm px-4 pb-2">{newFolderError}</div>}
                </>
              )}
            </div>
          </div>

          {/* Custom Footer */}
          <div className="modal-footer-custom">
            <div className="footer-left">
              {selectedCollection && (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="sm"
                  icon={<IconFolderPlus size={14} />}
                  onClick={() => setIsCreatingFolder(true)}
                >
                  New Folder
                </Button>
              )}
            </div>
            <div className="footer-right">
              <Button variant="outlined" color="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="filled" color="primary" size="sm" disabled={!selectedCollection}>
                Save
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </StyledWrapper>
  );
};

export default SaveTransientRequest;
