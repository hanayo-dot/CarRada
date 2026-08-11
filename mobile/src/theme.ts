import { ColorSchemeName } from 'react-native';

const base = {
  background: '#051523',
  surface: '#0E253B',
  primary: '#1B7DF5',
  success: '#26C281',
  warning: '#F2B90F',
  danger: '#E04E4E',
  text: '#FFFFFF',
  muted: '#A1B3C4'
};

const light = {
  background: '#F4F7FB',
  surface: '#FFFFFF',
  primary: '#1E60D6',
  success: '#0F9D58',
  warning: '#D98C05',
  danger: '#C62828',
  text: '#10203A',
  muted: '#6B7C93'
};

export function palette(scheme: ColorSchemeName) {
  return scheme === 'dark' ? base : light;
}
