import styled from 'styled-components';

const StyledWrapper = styled.div`
  /* Override modal sizing for compact look */
  .bruno-modal-card.modal-sm {
    min-width: 380px;
    max-width: 420px;
  }

  .bruno-modal-content {
    padding: 16px !important;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 10px;
    font-size: 12px;

    .breadcrumb-label {
      color: ${(props) => props.theme.colors.text.muted};
      margin-right: 2px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .breadcrumb-muted {
      color: ${(props) => props.theme.colors.text.muted};
      font-style: italic;
      font-size: 12px;
    }

    .breadcrumb-item {
      color: ${(props) => props.theme.modal.body.color};
      font-size: 12px;

      &.clickable {
        color: ${(props) => props.theme.textLink};
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }

      &.current {
        font-weight: 500;
        color: ${(props) => props.theme.modal.body.color};
      }
    }

    .breadcrumb-separator {
      color: ${(props) => props.theme.colors.text.muted};
      flex-shrink: 0;
      opacity: 0.5;
    }
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border: 1px solid ${(props) => props.theme.modal.input.border};
    border-radius: 6px;
    background: ${(props) => props.theme.modal.input.bg};
    margin-bottom: 6px;
    transition: border-color 0.15s ease;

    &:focus-within {
      border-color: ${(props) => props.theme.modal.input.focusBorder};
    }

    .search-icon {
      color: ${(props) => props.theme.colors.text.muted};
      flex-shrink: 0;
      opacity: 0.6;
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      color: ${(props) => props.theme.modal.body.color};
      font-size: 12px;
      outline: none;

      &::placeholder {
        color: ${(props) => props.theme.colors.text.muted};
        opacity: 0.7;
      }
    }
  }

  .folder-list {
    border: 1px solid ${(props) => props.theme.modal.input.border};
    border-radius: 6px;
    background: transparent;
    max-height: 200px;
    min-height: 80px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: ${(props) => props.theme.colors.text.muted};
      border-radius: 3px;
      opacity: 0.5;
    }
  }

  .folder-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.1s ease;
    color: ${(props) => props.theme.modal.body.color};

    &:first-child {
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
    }

    &:last-child {
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
    }

    &:hover {
      background: ${(props) => props.theme.listItem.hoverBg};
    }

    .folder-icon {
      color: ${(props) => props.theme.colors.text.muted};
      flex-shrink: 0;
      opacity: 0.8;
    }

    .folder-icon.collection-icon {
      color: ${(props) => props.theme.colors.text.yellow};
      opacity: 1;
    }

    .folder-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
    }

    .chevron-icon {
      color: ${(props) => props.theme.colors.text.muted};
      flex-shrink: 0;
      opacity: 0.4;
    }
  }

  .empty-state {
    padding: 20px 12px;
    text-align: center;
    color: ${(props) => props.theme.colors.text.muted};
    font-size: 12px;
    opacity: 0.8;
  }

  .request-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    color: ${(props) => props.theme.modal.body.color};

    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .request-method {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      flex-shrink: 0;
      min-width: 32px;
      letter-spacing: 0.2px;
    }

    .request-method.method-get {
      color: ${(props) => props.theme.request.methods.get};
    }

    .request-method.method-post {
      color: ${(props) => props.theme.request.methods.post};
    }

    .request-method.method-put {
      color: ${(props) => props.theme.request.methods.put};
    }

    .request-method.method-delete {
      color: ${(props) => props.theme.request.methods.delete};
    }

    .request-method.method-patch {
      color: ${(props) => props.theme.request.methods.patch};
    }

    .request-method.method-options {
      color: ${(props) => props.theme.request.methods.options};
    }

    .request-method.method-head {
      color: ${(props) => props.theme.request.methods.head};
    }

    .request-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
    }
  }

  .create-folder-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;

    .folder-icon {
      color: ${(props) => props.theme.colors.text.muted};
      flex-shrink: 0;
    }

    .new-folder-icon {
      color: ${(props) => props.theme.textLink};
    }

    input {
      flex: 1;
      padding: 5px 8px;
      border: 1px solid ${(props) => props.theme.modal.input.border};
      border-radius: 4px;
      background: ${(props) => props.theme.modal.input.bg};
      color: ${(props) => props.theme.modal.body.color};
      font-size: 12px;

      &:focus {
        outline: none;
        border-color: ${(props) => props.theme.modal.input.focusBorder};
      }
    }

    .btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
      border-radius: 4px;
      cursor: pointer;
      background: ${(props) => props.theme.button.secondary.bg};
      color: ${(props) => props.theme.button.secondary.color};
      border: none;
      transition: opacity 0.15s ease;

      &:hover {
        opacity: 0.8;
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .btn-icon-muted {
      background: transparent;
      color: ${(props) => props.theme.colors.text.muted};

      &:hover {
        color: ${(props) => props.theme.modal.body.color};
      }
    }
  }

  .modal-footer-custom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid ${(props) => props.theme.modal.input.border};

    .footer-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-new-folder {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      background: transparent;
      color: ${(props) => props.theme.textLink};
      border: 1px solid ${(props) => props.theme.modal.input.border};
      transition: all 0.15s ease;

      &:hover {
        border-color: ${(props) => props.theme.textLink};
        background: rgba(59, 130, 246, 0.08);
      }

      svg {
        flex-shrink: 0;
      }
    }

    .btn {
      font-size: 12px;
      padding: 6px 14px;
    }
  }

  /* Input field styling */
  label {
    font-size: 11px !important;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: ${(props) => props.theme.colors.text.muted};
    margin-bottom: 6px !important;
  }

  .textbox {
    padding: 8px 10px !important;
    font-size: 13px !important;
    border-radius: 6px !important;
  }
`;

export default StyledWrapper;
