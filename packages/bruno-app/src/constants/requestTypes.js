import { IconApi, IconBrandGraphql, IconArrowsExchange, IconCode } from '@tabler/icons';

export const REQUEST_TYPE_INFO = {
  'http-request': {
    label: 'HTTP',
    icon: IconApi,
    color: '#61affe',
    shortName: 'http'
  },
  'graphql-request': {
    label: 'GraphQL',
    icon: IconBrandGraphql,
    color: '#e535ab',
    shortName: 'graphql'
  },
  'grpc-request': {
    label: 'gRPC',
    icon: IconCode,
    color: '#00b4aa',
    shortName: 'grpc'
  },
  'ws-request': {
    label: 'WebSocket',
    icon: IconArrowsExchange,
    color: '#4ade80',
    shortName: 'ws'
  }
};

export const REQUEST_TYPES = Object.keys(REQUEST_TYPE_INFO);
