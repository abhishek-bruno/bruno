import styled from 'styled-components';

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  .text-muted {
    color: ${(props) => props.theme.text};
    opacity: 0.6;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
  }

  .empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 600px;
  }

  .empty-state-title {
    font-size: 20px;
    font-weight: 600;
    color: ${(props) => props.theme.text};
    margin: 0 0 6px 0;
  }

  .empty-state-subtitle {
    font-size: 13px;
    color: ${(props) => props.theme.text};
    opacity: 0.7;
    margin: 0 0 24px 0;
    line-height: 1.5;
  }

  .empty-state-sections {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    align-items: stretch;
  }

  .empty-state-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-title {
    font-size: 12px;
    font-weight: 600;
    color: ${(props) => props.theme.text};
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: left;
    margin-bottom: 4px;
  }

  .section-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    width: 100%;
  }

  .empty-state-btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 500;
    color: ${(props) => props.theme.text};
    background: transparent;
    border: 1px solid ${(props) => props.theme.border.border1};
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;

    &:hover {
      background-color: ${(props) => props.theme.sidebar.collection.item.hoverBg};
      border-color: ${(props) => props.theme.border.border2};
    }

    &:active {
      background-color: ${(props) => props.theme.sidebar.collection.item.bg};
    }

    svg {
      flex-shrink: 0;
      opacity: 0.8;
    }

    span {
      flex: 1;
    }
  }
`;

export default StyledWrapper;
