import styled from 'styled-components';

const StyledWrapper = styled.div`
  /* Collection Name Dropdown Trigger - matching workspace switcher style */
  .collection-name-container {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    background: transparent;
    border: none;
    color: inherit;

    &:hover {
      background: ${(props) => props.theme.sidebar.collection.item.hoverBg};
    }

    .collection-name {
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }

    .chevron-icon {
      flex-shrink: 0;
      color: ${(props) => props.theme.sidebar.muted};
      transition: transform 0.2s ease;
    }
  }

  /* Button variant for single collection (opens settings) */
  .collection-name-button {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  /* Environment button group - groups gear icon and environment selector */
  .environment-button-group {
    display: flex;
    align-items: center;
    gap: 0;
    background: ${(props) => props.theme.requestTabs.bg};
    border-radius: 6px;
    border: 1px solid ${(props) => props.theme.button2.color.secondary.border};

    > * {
      border-radius: 4px;
    }
  }
`;

export default StyledWrapper;
